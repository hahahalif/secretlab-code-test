# secretlab-code-test

## What I have done:
 - HTML Canvas element is used for this exercise
 - Used jQuery library for tagging feature
 - Used Bootstrap framework for quick layout implementation
 - Ability to create and clear annotation tags on the image
 - Ability to load and store image in the local storage
 - Ability to store tags in the local storage
 - Ability to delete image

## What I was unable to achieve:
- Multiple images with tags
- Responsive canvas

## Thought Process
I had zero experience working with HTML5 Canvas. This exercise has pushed me beyond my comfort zone. I tried to learn and adapt within the timeframe given for me to complete the exercise. I decided to use Bootstrap framework as I am very familiar with it.

I managed to use the draw function to draw the image onto the canvas after the image selection from the file browser. The image then stored into local storage so that the image can be restored on refreshed. I managed to implement tagging feature by drawing rectangles onto the canvas. Then, a prompt requesting for the tag name and the tag's positioning and name are stored in an array. Using mousemove event on canvas, the tag will appear on the canvas with the ability to delete the tag by clicking on the 'x' button. The tag will also be shown as a taglist at the bottom of the canvas. The tags are stored in local storage too.

## Limitations
Due to time constraint, work commitment and unfamiliarity with HTML5 canvas, I was unable to implement the multiple images with tags feature. Also, I didn't get to make sure the canvas to be responsive so this application only works on desktop.

Implementing the multiple images with tags feature would require some rewrite of the codes to be able to handle array of images and tags stored in the local storage and redraw the content onto the canvas whenever the user clicks on previous or delete buttons.

I also found out that local storage can only store 5mb of data so I believed that would be an issue if the user were to upload more than 5 images. I didn't get to come up with the workaround on this issue. On top of my head, I was already thinking of using multiple local storage keys/items to store the image instead of pushing an array of images into one single key/item.

## Learning Process
I read up and digested the Canvas API information from MDN Web Docs. I also got some ideas and implementations from Stack Overflow. 
