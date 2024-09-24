## AI Generated Images

The phoenix logo and icons used in this app were AI-generated using ChatGPT and DALL-E.

See [prompts](#ai-prompts) for full details.

## Convert .png to .icns and .ico

[Install ImageMagick](https://imagemagick.org/script/download.php)

```shell
magick phoenix.png -resize 512x512 -define icns:format=icns icon.icns
magick phoenix.png -resize 256x256 -define ico:format=ico icon.ico
magick phoenix.png -define png:format=png icon.png

mv ./icon.* ../build
```

## AI Prompts

Prompt created by ChatGPT-4o on August 29, 2024.

https://openai.com/policies/terms-of-use/

### Prompt 1

"I'm developing a high fantasy medieval role playing game.
The logo for this game will be a red fiery phoenix.
Your goal is to describe the phoenix for an AI image generator to then generate said phoenix."

### Response 1

"A majestic red fiery phoenix with large, outstretched wings. The phoenix's feathers are a vibrant mix of deep crimson and bright orange, giving the impression of flames. The tail feathers are long, flowing, and resemble trails of fire, with glowing embers falling from them. Its eyes are intense, burning with a golden hue, and its beak is sharp and slightly curved. The body is sleek and muscular, with flames flickering around its form, especially along the wings and tail. The background is a dark, starry sky, contrasting with the phoenix's bright, fiery aura. The overall style should be bold, dynamic, and mythical, evoking the high fantasy medieval theme."

### Prompt 2

"Great, using your description, please generate said image of the phoenix."

### Response 2:

Generated phoenix image.
