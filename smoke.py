"""Basic offline browser smoke test for Chai & Fox Home.

Tests the exact split HTML/CSS/JS and character PNG files by inlining them in
memory for Chromium's set_content().  This avoids needing a local web server.
"""
import base64
import pathlib
import shutil
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parent.parent
html=(ROOT/'index.html').read_text('utf-8')
css=(ROOT/'styles.css').read_text('utf-8')
js=(ROOT/'app.js').read_text('utf-8')
html=html.replace('<link rel="stylesheet" href="styles.css">', '<style>'+css+'</style>')
for name in ('shiba','fox','chick'):
    blob=base64.b64encode((ROOT/'assets'/'characters'/f'{name}.png').read_bytes()).decode('ascii')
    js=js.replace(f'assets/characters/{name}.png',f'data:image/png;base64,{blob}')
html=html.replace('<script src="app.js" defer></script>', '<script>'+js+'</script>')

with sync_playwright() as p:
    executable=shutil.which('chromium') or shutil.which('google-chrome')
    browser=p.chromium.launch(headless=True, executable_path=executable, args=['--no-sandbox'] if executable else [])
    for width,height in ((1440,900),(390,844)):
        page=browser.new_page(viewport={'width':width,'height':height})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='load')
        assert '柴狐小屋' in page.title()
        assert page.locator('#scene').count()==1
        assert page.locator('.character').count()>=1
        assert page.locator('.character img').first.evaluate('(x)=>x.complete && x.naturalWidth>0'), 'character PNG not loaded'
        assert page.locator('#play-main-btn').count()==1
        page.locator('#mail-btn').click()
        assert page.locator('#letter-text').count()==1
        page.locator('#letter-text').fill('今天发生了一件开心的小事。')
        page.locator('[data-v03="saveLetter"]').click()
        assert page.locator('.letter-entry').count()==1
        assert '今天发生了一件开心的小事。' in page.locator('.letter-entry').inner_text()
        assert not errors, 'Uncaught JavaScript errors: '+repr(errors)
        print(f'PASS Chai & Fox browser smoke, {width}x{height}')
        page.close()
    browser.close()
