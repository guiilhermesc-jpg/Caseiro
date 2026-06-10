# Publica o jogo no Cloudflare Pages (caseiro.pages.dev)
# Carrega as credenciais do .env e roda o wrangler.
Set-Location $PSScriptRoot
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.+)$') { Set-Item "env:$($matches[1].Trim())" $matches[2].Trim() }
}
npx wrangler pages deploy dist --project-name=caseiro --commit-dirty=true
