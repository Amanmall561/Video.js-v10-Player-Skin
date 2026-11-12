import subprocess
import os

img1 = "src/assets/images/cartoon_bright_day_1794472191647.jpg"
img2 = "src/assets/images/cartoon_action_flight_1794472191038.jpg"
img3 = "src/assets/images/cartoon_dark_night_1794472192838.jpg"
img4 = "src/assets/images/cartoon_party_dance_1794472193061.jpg"

font_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
output_file = "public/videos/trending-cartoon-reel.mp4"

# 20 seconds total (4 clips of 5s each at 30fps)
cmd = [
    "ffmpeg", "-y",
    # Input 0: Scene 1 (Bright)
    "-loop", "1", "-t", "5", "-i", img1,
    # Input 1: Scene 2 (Action)
    "-loop", "1", "-t", "5", "-i", img2,
    # Input 2: Scene 3 (Dark Neon)
    "-loop", "1", "-t", "5", "-i", img3,
    # Input 3: Scene 4 (Party)
    "-loop", "1", "-t", "5", "-i", img4,
    # Input 4: Audio track (Upbeat synth chords and bass)
    "-f", "lavfi", "-i", "sine=f=523.25:b=4:d=20",
    "-f", "lavfi", "-i", "sine=f=261.63:b=2:d=20",
    "-filter_complex",
    f"""
    [0:v]scale=1920:1080,zoompan=z='min(zoom+0.0015,1.2)':d=150:s=1920x1080:fps=30,
         drawbox=x=40:y=40:w=440:h=60:color=black@0.6:t=fill,
         drawtext=fontfile='{font_path}':text='SCENE 1 // SUNNY CANDY CITY':fontcolor=0xfde047:fontsize=22:x=60:y=58[v0];

    [1:v]scale=1920:1080,zoompan=z='min(max(zoom,pzoom)+0.0012,1.2)':x='iw*0.1*(on/150)':d=150:s=1920x1080:fps=30,
         drawbox=x=40:y=40:w=440:h=60:color=black@0.6:t=fill,
         drawtext=fontfile='{font_path}':text='SCENE 2 // RAINBOW FLIGHT':fontcolor=0x38bdf8:fontsize=22:x=60:y=58[v1];

    [2:v]scale=1920:1080,zoompan=z='min(zoom+0.0015,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s=1920x1080:fps=30,
         drawbox=x=40:y=40:w=440:h=60:color=black@0.7:t=fill,
         drawtext=fontfile='{font_path}':text='SCENE 3 // NEON MIDNIGHT':fontcolor=0xc084fc:fontsize=22:x=60:y=58[v2];

    [3:v]scale=1920:1080,zoompan=z='if(lte(zoom,1.0),1.15,max(1.0,zoom-0.0012))':d=150:s=1920x1080:fps=30,
         drawbox=x=40:y=40:w=440:h=60:color=black@0.6:t=fill,
         drawtext=fontfile='{font_path}':text='SCENE 4 // BOOMBOX PARTY':fontcolor=0xf43f5e:fontsize=22:x=60:y=58[v3];

    [v0][v1][v2][v3]concat=n=4:v=1:a=0[vout];

    [4:a][5:a]amix=inputs=2:duration=first,volume=0.45[aout]
    """,
    "-map", "[vout]",
    "-map", "[aout]",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "fast",
    "-crf", "20",
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    output_file
]

print("Compiling cartoon reel video...")
subprocess.run(cmd, check=True)
print("Saved cartoon reel to:", output_file)
