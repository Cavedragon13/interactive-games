#!/usr/bin/env python3
"""
Generate og-preview.png for Survival Decision Series
Uses Z-Image Base API on port 8011
"""

from gradio_client import Client
from pathlib import Path
import shutil

# Connect to local Z-Image Base
client = Client("http://127.0.0.1:8011/")

# Prompt from VISUAL_ASSETS.md
prompt = """Professional social media preview card design for survival training game.
Dark navy blue gradient background transitioning from #1a2f5a to #0d1b3a diagonal gradient.
Center: large glowing cyan compass rose symbol in #3a7ca5 color with bright red (#ef4444)
north arrow pointing upward. Surrounding the compass in a circle: 8 small white minimalist
icons representing moon crescent, ocean waves, snowy mountain peak, ice crystal, jungle palm
leaf, mine tunnel entrance, submarine, asteroid rock. Bold white sans-serif text at top
center: "SURVIVAL DECISION SERIES" in large clear letters. Smaller white text at bottom
center: "Test Your Survival Skills Against NASA, Coast Guard & Military Experts". Clean
modern UI design, high contrast, glassmorphism effects, gaming aesthetic, professional web
banner style, perfect typography, social media card format, 1200x630 pixels"""

negative_prompt = """blurry text, unreadable text, low contrast, cluttered, messy, amateur,
pixelated, distorted text, watermark, copyright, trademark symbols, grainy, low quality,
poor typography, illegible letters"""

print("Generating og-preview.png...")
print(f"Calling Z-Image Base API...")

result = client.predict(
    prompt=prompt,
    negative_prompt=negative_prompt,
    aspect_ratio="Custom",  # Use custom dimensions
    width=1200,
    height=640,  # Must be divisible by 16 (630 rounds to 640)
    guidance_scale=7.5,
    num_inference_steps=30,
    seed=-1,  # Random seed
    lora_name="None",
    lora_scale=1.0,
    api_name="/generate_image"
)

# Result is a tuple (image_path, status_message)
generated_image_path = result[0]
status_message = result[1]

print(f"Status: {status_message}")
print(f"Generated image: {generated_image_path}")

if generated_image_path is None:
    print("❌ Generation failed!")
    exit(1)

# Copy to repository as og-preview.png
output_path = Path("og-preview.png")
shutil.copy(generated_image_path, output_path)

print(f"✓ Saved to: {output_path.absolute()}")
print("\nNext steps:")
print("1. Verify the image looks good")
print("2. Check that text is readable")
print("3. Test social media preview (upload to GitHub)")
