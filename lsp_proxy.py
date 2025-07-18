import asyncio
import websockets
import subprocess

PORT = 8765

def get_lsp_command(language):
    if language == 'python':
        return ['pyright-langserver', '--stdio']
    elif language == 'csharp':
        return ['omnisharp', '-lsp']
    elif language == 'java':
        return [
            'java', '-jar',
            '/path/to/eclipse-jdt-language-server/plugins/org.eclipse.equinox.launcher_*.jar',
            '-configuration', '/path/to/eclipse-jdt-language-server/config_linux',
            '-data', '/tmp'
        ]
    else:
        return None

async def handle_connection(websocket, path):
    language = path.strip('/').lower()
    print(f"[LSP Proxy] WebSocket bağlantısı geldi: {language}")

    lsp_command = get_lsp_command(language)
    if not lsp_command:
        print(f"[HATA] Desteklenmeyen dil: {language}")
        await websocket.close()
        return

    process = await asyncio.create_subprocess_exec(
        *lsp_command,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE
    )

    async def read_from_lsp():
        while True:
            try:
                header = await process.stdout.readline()
                if not header:
                    break
                length = int(header.decode().strip().split(":")[1])
                await process.stdout.readline()  # boş satır
                body = await process.stdout.read(length)
                await websocket.send(body)
            except Exception as e:
                print(f"[HATA][LSP'den Okuma]: {e}")
                break

    async def write_to_lsp():
        async for message in websocket:
            try:
                content = message.encode()
                header = f"Content-Length: {len(content)}\r\n\r\n".encode()
                process.stdin.write(header + content)
                await process.stdin.drain()
            except Exception as e:
                print(f"[HATA][LSP'ye Yazma]: {e}")
                break

    await asyncio.gather(read_from_lsp(), write_to_lsp())
    process.kill()
    print(f"[KAPANDI] {language} bağlantısı sona erdi.")

start_server = websockets.serve(handle_connection, "localhost", PORT)
print(f"🚀 LSP Proxy çalışıyor: ws://localhost:{PORT}/<language>")

async def main():
    print(f"🚀 LSP Proxy çalışıyor: ws://localhost:{PORT}/<language>")
    async with websockets.serve(handle_connection, "localhost", PORT):
        await asyncio.Future()  # sonsuza kadar açık kalsın

asyncio.run(main())
