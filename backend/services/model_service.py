import threading
from typing import Generator, List

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer

from config import settings


class ModelService:
    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.loaded = False
        self.last_error = ''

    def reset(self):
        self.tokenizer = None
        self.model = None
        self.loaded = False
        self.last_error = ''

    def load(self):
        if self.loaded:
            return
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(settings.MODEL_PATH, trust_remote_code=True)
            self.model = AutoModelForCausalLM.from_pretrained(
                settings.MODEL_PATH,
                trust_remote_code=True,
                torch_dtype='auto',
                device_map='auto' if torch.cuda.is_available() else None,
            )
            self.loaded = True
            self.last_error = ''
        except Exception as exc:
            self.reset()
            self.last_error = str(exc)
            raise

    def _message_value(self, item, key):
        if isinstance(item, dict):
            return item.get(key, '')
        return getattr(item, key, '')

    def _truncate_text(self, text: str, limit: int):
        if len(text) <= limit:
            return text
        return f'{text[:limit]}\n...[truncated]'

    def _normalize_history(self, history: List[dict]):
        normalized = []
        for item in history[-settings.MAX_HISTORY_MESSAGES :]:
            role = self._message_value(item, 'role')
            content = self._truncate_text(self._message_value(item, 'content'), settings.MAX_HISTORY_CHARS_PER_MESSAGE)
            normalized.append({'role': role, 'content': content})
        return normalized

    def build_prompt(self, history: List[dict], question: str, context: str = ''):
        sections = [
            '你是一个中文助手。请优先直接回答“当前问题”，不要把历史问题当成当前问题来回答。',
        ]

        if context:
            trimmed_context = self._truncate_text(context, settings.MAX_RAG_CONTEXT_CHARS)
            sections.append(
                '知识库上下文：\n'
                f'{trimmed_context}\n'
                '如果知识库上下文不足以支持结论，请明确说明，不要编造。'
            )

        normalized_history = self._normalize_history(history)
        if normalized_history:
            history_lines = [f"{item['role']}: {item['content']}" for item in normalized_history]
            sections.append('历史对话：\n' + '\n'.join(history_lines))

        sections.append(f'当前问题：\n{question}')
        sections.append('请围绕“当前问题”作答。\nassistant:')
        return '\n\n'.join(sections)

    def generate(self, history: List[dict], question: str, context: str = ''):
        self.load()
        prompt = self.build_prompt(history, question, context)
        inputs = self.tokenizer(prompt, return_tensors='pt').to(self.model.device)
        output = self.model.generate(
            **inputs,
            max_new_tokens=settings.MAX_NEW_TOKENS,
            do_sample=True,
            temperature=settings.TEMPERATURE,
            top_p=settings.TOP_P,
            repetition_penalty=settings.REPETITION_PENALTY,
            pad_token_id=self.tokenizer.eos_token_id,
        )
        generated_ids = output[0][inputs['input_ids'].shape[1] :]
        return self.tokenizer.decode(generated_ids, skip_special_tokens=True).strip()

    def stream_generate(self, history: List[dict], question: str, context: str = '') -> Generator[str, None, None]:
        self.load()
        prompt = self.build_prompt(history, question, context)
        inputs = self.tokenizer(prompt, return_tensors='pt').to(self.model.device)
        streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True, skip_special_tokens=True)
        generation_kwargs = dict(
            **inputs,
            streamer=streamer,
            max_new_tokens=settings.MAX_NEW_TOKENS,
            do_sample=True,
            temperature=settings.TEMPERATURE,
            top_p=settings.TOP_P,
            repetition_penalty=settings.REPETITION_PENALTY,
            pad_token_id=self.tokenizer.eos_token_id,
        )

        thread = threading.Thread(target=self.model.generate, kwargs=generation_kwargs)
        thread.start()
        for text in streamer:
            yield text


model_service = ModelService()
