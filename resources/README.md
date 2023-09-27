## AI Generated Images

The phoenix logo and icons used in this app were AI-generated using
Canva's [Text to Image](https://www.canva.com/your-apps/text-to-image) app.

Canva's [AI Product Terms](https://www.canva.com/policies/ai-product-terms/).

## Convert .png to .icns and .ico

[Install ImageMagick](https://imagemagick.org/script/download.php)

```shell
convert phoenix.png -resize 512x512 -define icns:format=icns icon.icns
convert phoenix.png -resize 256x256 -define ico:format=ico icon.ico
convert phoenix.png -define png:format=png icon.png

mv ./icon.* ../build
```
