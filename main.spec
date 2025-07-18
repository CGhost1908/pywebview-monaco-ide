# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[('index.html', '.'), ('ai_deneme.html', '.'), ('style.css', '.'), ('config.json', '.'), ('database.db', '.'), ('language.js', '.'), ('interactlib.js', '.'), ('machine-learning.js', '.'), ('script.js', '.'), ('window.js', '.'), ('open-folder.js', '.'), ('open-file.js', '.'), ('shortcuts.js', '.'), ('watcher.js', '.'), ('save.js', '.'), ('code.js', '.'), ('terminal.js', '.'), ('right-click.js', '.'), ('onwebviewloaded.js', '.'), ('reload.js', '.'), ('package.json', '.'), ('package-lock.json', '.'), ('node_modules', 'node_modules')],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='main',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['icon.ico'],
)
