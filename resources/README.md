## AI Generated Images

The phoenix logo and icons used in this app were AI-generated using
Canva's [Text to Image](https://www.canva.com/your-apps/text-to-image) app.

Canva's [AI Product Terms](https://www.canva.com/policies/ai-product-terms/).

## Convert .png to .icns and .ico

[Install ImageMagick](https://imagemagick.org/script/download.php)

```shell
convert phoenix.png -resize 512x512 -define icns:format=icns phoenix.icns
convert phoenix.png -resize 215x215 -define ico:format=ico phoenix.ico
```
