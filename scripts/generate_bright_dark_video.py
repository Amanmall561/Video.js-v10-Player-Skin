import subprocess
import os

font_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
output_file = "public/videos/curated-bright-dark-reel.mp4"

# Generate 24-second composite video using ffmpeg filter_complex
cmd = [
    "ffmpeg", "-y",
    # Input 0: Bright segment (8s, 1920x1080, 30fps)
    "-f", "lavfi", "-i", "color=c=0xf4f7fb:s=1920x1080:d=8:r=30",
    # Input 1: Dark segment (8s, 1920x1080, 30fps)
    "-f", "lavfi", "-i", "color=c=0x080a0f:s=1920x1080:d=8:r=30",
    # Input 2: Dynamic split segment (8s, 1920x1080, 30fps)
    "-f", "lavfi", "-i", "smptebars=s=1920x1080:d=8:r=30",
    # Input 3: Audio synthesis (24s stereo synth track)
    "-f", "lavfi", "-i", "sine=f=440:b=4:d=24",
    "-filter_complex",
    f"""
    [0:v]drawtext=fontfile='{font_path}':text='STAGE 01 // HIGH-KEY BRIGHT REEL':fontcolor=0x0f172a:fontsize=56:x=(w-text_w)/2:y=180,
         drawtext=fontfile='{font_path}':text='LUMINANCE 96% · SNOW & DAYLIGHT WCAG BENCHMARK':fontcolor=0x334155:fontsize=32:x=(w-text_w)/2:y=260,
         drawbox=x=160:y=340:w=1600:h=4:color=0x94a3b8@0.8:t=fill,
         drawtext=fontfile='{font_path}':text='AUDIT TARGET: ENSURE CONTROLS & TIMELINE REMAIN 100% LEGIBLE':fontcolor=0x475569:fontsize=28:x=(w-text_w)/2:y=400,
         drawtext=fontfile='{font_path}':text='FRAME %{{n}}':start_number=1:fontcolor=0xd97706:fontsize=48:x=(w-text_w)/2:y=520,
         drawtext=fontfile='{font_path}':text='TIME: %{{pts\\:hms}}':fontcolor=0x0284c7:fontsize=36:x=(w-text_w)/2:y=600,
         drawbox=x=460:y=720:w=1000:h=120:color=0xe2e8f0@0.9:t=fill,
         drawtext=fontfile='{font_path}':text='SYNTH//10 OPTICAL GRADIENT SCRIM ACTIVE · 8.4\\:1 CONTRAST':fontcolor=0x0f172a:fontsize=26:x=(w-text_w)/2:y=765[v0];

    [1:v]drawtext=fontfile='{font_path}':text='STAGE 02 // LOW-KEY DARK REEL':fontcolor=0xf8fafc:fontsize=56:x=(w-text_w)/2:y=180,
         drawtext=fontfile='{font_path}':text='LUMINANCE 4% · DEEP SHADOW & NEBULA BENCHMARK':fontcolor=0x94a3b8:fontsize=32:x=(w-text_w)/2:y=260,
         drawbox=x=160:y=340:w=1600:h=4:color=0xf59e0b@0.8:t=fill,
         drawtext=fontfile='{font_path}':text='AUDIT TARGET: VERIFY AMBER PHOSPHOR & VU METER SEPARATION':fontcolor=0xcbd5e1:fontsize=28:x=(w-text_w)/2:y=400,
         drawtext=fontfile='{font_path}':text='FRAME %{{n}}':start_number=241:fontcolor=0xf59e0b:fontsize=48:x=(w-text_w)/2:y=520,
         drawtext=fontfile='{font_path}':text='TIME: %{{pts\\:hms}}':fontcolor=0x38bdf8:fontsize=36:x=(w-text_w)/2:y=600,
         drawbox=x=460:y=720:w=1000:h=120:color=0x111827@0.9:t=fill,
         drawtext=fontfile='{font_path}':text='TACTILE DECK ILLUMINATION · ZERO CLIPPING IN SHADOWS':fontcolor=0xf1f5f9:fontsize=26:x=(w-text_w)/2:y=765[v1];

    [2:v]drawtext=fontfile='{font_path}':text='STAGE 03 // DYNAMIC CHROMA & JOG-SHUTTLE REEL':fontcolor=0xffffff:fontsize=52:x=(w-text_w)/2:y=180,
         drawtext=fontfile='{font_path}':text='BROADCAST SMPTE CALIBRATION & 6 DEGREE JOG PRECISION':fontcolor=0xfde047:fontsize=32:x=(w-text_w)/2:y=260,
         drawtext=fontfile='{font_path}':text='FRAME %{{n}}':start_number=481:fontcolor=0x4ade80:fontsize=48:x=(w-text_w)/2:y=520,
         drawtext=fontfile='{font_path}':text='TIME: %{{pts\\:hms}}':fontcolor=0xffffff:fontsize=36:x=(w-text_w)/2:y=600,
         drawbox=x=360:y=700:w=1200:h=120:color=0x000000@0.85:t=fill,
         drawtext=fontfile='{font_path}':text='VIDEO.JS V10 MASTER REEL COMPLETE · 24 SECONDS BENCHMARK':fontcolor=0x38bdf8:fontsize=26:x=(w-text_w)/2:y=745[v2];

    [v0][v1][v2]concat=n=3:v=1:a=0[vout];

    [3:a]volume=0.3,pan=stereo|c0=c0|c1=c0[aout]
    """,
    "-map", "[vout]",
    "-map", "[aout]",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "fast",
    "-crf", "22",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    output_file
]

print("Running command:", " ".join(cmd))
subprocess.run(cmd, check=True)
print("Video generated successfully at:", output_file)
