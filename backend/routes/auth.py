from fastapi import APIRouter, HTTPException

from models.schemas import LoginRequest

router = APIRouter(prefix='/api/auth', tags=['auth'])


@router.post('/login')
def login(payload: LoginRequest):
  username = payload.username.strip()
  valid_usernames = {'sdd', 'SDD', 'demo'}

  if username in valid_usernames and payload.password == '123456':
      return {
          'token': 'demo-token',
          'user': {'username': 'SDD', 'role': 'frontend-engineer'}
      }
  raise HTTPException(status_code=401, detail='用户名或密码错误')
