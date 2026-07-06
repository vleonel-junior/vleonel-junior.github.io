from PIL import Image

# Open the image
img = Image.open('public/images/me_sketch.png')

# The image is 880x1206. We want to crop it to the torso level.
# A square crop from the top (880x880) usually captures the head and torso perfectly.
width, height = img.size
crop_area = (0, 0, width, width) # left, upper, right, lower

# Crop and save
cropped_img = img.crop(crop_area)
cropped_img.save('public/images/me_cropped.png')
print("Image cropped successfully.")
