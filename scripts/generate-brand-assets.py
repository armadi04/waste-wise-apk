from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT.parent / 'waste-wise-web/frontend'
SOURCE = WEB / 'public/favicon_io/android-chrome-512x512.png'

source = Image.open(SOURCE).convert('RGBA')
logo = source.crop(source.getchannel('A').getbbox())


def fit(image: Image.Image, size: int) -> Image.Image:
    return ImageOps.contain(image, (size, size), Image.Resampling.LANCZOS)


def canvas(size: int, color=(0, 0, 0, 0)) -> Image.Image:
    return Image.new('RGBA', (size, size), color)


def place(base: Image.Image, image: Image.Image) -> Image.Image:
    base.alpha_composite(
        image,
        ((base.width - image.width) // 2, (base.height - image.height) // 2),
    )
    return base


place(canvas(1024, (255, 255, 255, 255)), fit(logo, 760)).save(
    ROOT / 'assets/icon.png'
)
place(canvas(1024), fit(logo, 660)).save(
    ROOT / 'assets/adaptive-icon-foreground.png'
)

mono_mask = fit(logo, 660)
mono_mask.putalpha(
    mono_mask.getchannel('A').point(lambda value: 0 if value < 48 else 255)
)
mono = Image.new('RGBA', mono_mask.size, (0, 0, 0, 255))
mono.putalpha(mono_mask.getchannel('A'))
place(canvas(1024), mono).save(ROOT / 'assets/adaptive-icon-monochrome.png')

place(canvas(1024), fit(logo, 500)).save(ROOT / 'assets/splash-icon.png')

(ROOT / 'src/assets/brand').mkdir(parents=True, exist_ok=True)
(ROOT / 'src/assets/images').mkdir(parents=True, exist_ok=True)
(ROOT / 'src/assets/lottie').mkdir(parents=True, exist_ok=True)

fit(logo, 512).save(ROOT / 'src/assets/brand/logo.png')
fit(logo, 96).save(ROOT / 'assets/favicon.png')

for name in ('login-day.webp', 'login-night.webp'):
    (ROOT / 'src/assets/images' / name).write_bytes(
        (WEB / 'src/assets/images' / name).read_bytes()
    )

for name in ('empty.json', '404.json'):
    (ROOT / 'src/assets/lottie' / name).write_bytes(
        (WEB / 'src/assets/lottie' / name).read_bytes()
    )

print('Brand assets generated')
