# Admin

## Acesso

- Login: `/admin`
- Upload de lineup: `/admin/upload`
- O acesso é validado por `profiles.role` (`admin` ou `moderator`). A tela esconde o que não é permitido,
  mas **quem barra de verdade é o RLS do Postgres** — mesmo que alguém burle o front, o banco recusa.

## Publicar uma lineup

1. Abra `/admin` em qualquer dispositivo e faça login.
2. Em `/admin/upload`, preencha título, agente, mapa, habilidade, dificuldade, lado e descrição.
3. Cole a URL do vídeo (YouTube, Twitch, Streamable ou Medal).
4. Clique no ponto do mapa onde a lineup acontece — o marcador é salvo em percentual.
5. Enviar. A lineup entra como `approved` (admins) e aparece imediatamente no site.

Não é necessário buildar nem subir arquivos: o upload grava direto no Supabase.

## Papéis

| Papel | Pode |
|---|---|
| `user` | enviar lineup como `pending` (fase comunidade) |
| `moderator` | aprovar/rejeitar envios, editar e excluir lineups |
| `admin` | tudo acima + gerenciar papéis |

## Criar novos administradores

1. **Criar a conta**: Supabase → *Authentication → Users → Add user* (marque **Auto Confirm**).
   O trigger cria o `profile` automaticamente.
2. **Dar o papel**: abra `/admin/equipe`, encontre o e-mail e troque para **Administrador** ou **Moderador**.
3. Alternativa por SQL:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'pessoa@email.com');
```

Papéis: `user` (só lê e envia pendente), `moderator` (publica, edita e exclui lineups) e `admin`
(tudo acima + gerencia a equipe). A tela de equipe é visível apenas para `admin`.

## Tela de equipe (`/admin/equipe`)

- Lista e-mails, papel e data de criação via `list_profiles()` (`security definer`, só admin).
- Permite promover/rebaixar usuários.
- **Não** cria contas: isso exige a Admin API do Supabase (service role), que não roda em site estático —
  por isso o passo 1 é feito no dashboard. A tela continua funcionando com o site publicado.
