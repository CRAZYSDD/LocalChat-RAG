import os
import pickle
import uuid
from datetime import datetime
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from config import settings
from utils.document import parse_document, split_text
from utils.storage import read_json, write_json


INDEX_FILE = Path(settings.VECTOR_DB_PATH) / 'index.faiss'
META_FILE = Path(settings.VECTOR_DB_PATH) / 'metadata.pkl'


class KnowledgeService:
    def __init__(self):
        self.embedding_model = None
        self.last_error = ''

    def reset(self):
        self.embedding_model = None
        self.last_error = ''

    def load_embedding_model(self):
        if self.embedding_model is None:
            try:
                self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL_PATH)
                self.last_error = ''
            except Exception as exc:
                self.embedding_model = None
                self.last_error = str(exc)
                raise
        return self.embedding_model

    def list_files(self):
        return read_json(settings.DOCS_FILE, [])

    def save_files(self, docs):
        write_json(settings.DOCS_FILE, docs)

    def upload(self, upload_file):
        file_id = str(uuid.uuid4())
        original_name = upload_file.filename or 'unnamed'
        file_path = Path(settings.UPLOAD_DIR) / f'{file_id}_{original_name}'

        try:
          with open(file_path, 'wb') as buffer:
              buffer.write(upload_file.file.read())

          raw_text = parse_document(file_path)
          chunks = split_text(raw_text)
          if not chunks:
              raise ValueError('文档解析成功，但未提取到可用内容，请确认文件不是空白文档。')

          doc = {
              'id': file_id,
              'file_name': original_name,
              'path': str(file_path),
              'status': 'chunked',
              'chunk_count': len(chunks),
              'chunks': chunks,
              'preview_chunks': chunks[:5],
              'updated_at': datetime.utcnow().isoformat()
          }
          docs = self.list_files()
          docs.insert(0, doc)
          self.save_files(docs)
          return {key: value for key, value in doc.items() if key != 'chunks'}
        except Exception:
          if file_path.exists():
              file_path.unlink()
          raise
        finally:
          upload_file.file.close()

    def delete(self, file_id: str):
        docs = self.list_files()
        target = next((doc for doc in docs if doc['id'] == file_id), None)
        if target and os.path.exists(target['path']):
            os.remove(target['path'])
        docs = [doc for doc in docs if doc['id'] != file_id]
        self.save_files(docs)
        self.reindex()

    def reindex(self):
        docs = self.list_files()
        if not docs:
            if INDEX_FILE.exists():
                INDEX_FILE.unlink()
            if META_FILE.exists():
                META_FILE.unlink()
            return {'status': 'empty'}

        model = self.load_embedding_model()
        corpus = []
        metadata = []
        for doc in docs:
            for index, chunk in enumerate(doc.get('chunks', [])):
                corpus.append(chunk)
                metadata.append({
                    'file_id': doc['id'],
                    'file_name': doc['file_name'],
                    'chunk_index': index,
                    'content': chunk
                })
            doc['status'] = 'indexed'

        embeddings = model.encode(corpus, normalize_embeddings=True)
        vectors = np.asarray(embeddings, dtype='float32')
        index = faiss.IndexFlatIP(vectors.shape[1])
        index.add(vectors)
        faiss.write_index(index, str(INDEX_FILE))
        with open(META_FILE, 'wb') as file:
            pickle.dump(metadata, file)
        self.save_files(docs)
        return {'status': 'indexed', 'total_chunks': len(corpus)}

    def search(self, question: str, top_k: int = 3):
        if not INDEX_FILE.exists() or not META_FILE.exists():
            return []
        model = self.load_embedding_model()
        query_vector = np.asarray(model.encode([question], normalize_embeddings=True), dtype='float32')
        index = faiss.read_index(str(INDEX_FILE))
        scores, indices = index.search(query_vector, top_k)
        with open(META_FILE, 'rb') as file:
            metadata = pickle.load(file)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            results.append({**metadata[idx], 'score': float(score)})
        return results


knowledge_service = KnowledgeService()
