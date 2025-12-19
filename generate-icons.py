from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    # Create image with gradient background
    img = Image.new('RGB', (size, size), color='#6366f1')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient effect (simple)
    for i in range(size):
        alpha = i / size
        color = tuple(int(a * (1-alpha) + b * alpha) 
                     for a, b in zip((99, 102, 241), (139, 92, 246)))
        draw.rectangle([(0, i), (size, i+1)], fill=color)
    
    # Add rounded corners
    mask = Image.new('L', (size, size), 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.rounded_rectangle([(0, 0), (size, size)], radius=size//6, fill=255)
    img.putalpha(mask)
    
    # Save
    img.save(f'icon-{size}.png', 'PNG')
    print(f'Created icon-{size}.png')

create_icon(192)
create_icon(512)
