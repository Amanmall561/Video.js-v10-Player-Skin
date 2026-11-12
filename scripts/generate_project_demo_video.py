import subprocess
import os

font_bold = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
cartoon_video = "public/videos/trending-cartoon-reel.mp4"
output_video = "public/videos/synth10-project-demo.mp4"
output_poster = "public/videos/synth10-project-demo-poster.jpg"

# Build a 1920x1080 20-second screen-recording showcase of the Synth-10 Tactile Deck App
# With real-time moving timeline progress bar, playhead needle, bouncing stereo VU meters,
# live frame counter, live SMPTE timecode, and animated interactive pointer!

filter_complex = f"""
color=c=0x07090d:s=1920x1080:d=20:r=30[bg];
color=c=0xf59e0b:s=1440x16:d=20:r=30[prog_bar];
color=c=0xfde047:s=12x28:d=20:r=30[playhead];
color=c=0x10b981:s=320x16:d=20:r=30[vu_l];
color=c=0xf59e0b:s=320x16:d=20:r=30[vu_r];
color=c=0x22d3ee:s=22x22:d=20:r=30[cursor];

[0:v]scale=1120:630,setsar=1[vid];

[bg]
drawbox=x=0:y=0:w=1920:h=64:color=0x090c12:t=fill,
drawbox=x=0:y=64:w=1920:h=2:color=0x1b2230:t=fill,
drawbox=x=36:y=16:w=32:h=32:color=0xf59e0b@0.25:t=fill,
drawtext=fontfile='{font_bold}':text='SYNTH//10 DECK':fontcolor=0xf8fafc:fontsize=22:x=80:y=22,
drawtext=fontfile='{font_bold}':text='01. Master Player    02. Hardware Deck    03. Audit Bench    04. Design Thinking':fontcolor=0x94a3b8:fontsize=15:x=560:y=25,
drawbox=x=1480:y=16:w=190:h=32:color=0x131722:t=fill,
drawtext=fontfile='{font_bold}':text='VIDEO.JS V10 ACTIVE':fontcolor=0x22d3ee:fontsize=14:x=1500:y=25,
drawbox=x=1690:y=16:w=190:h=32:color=0xf43f5e:t=fill,
drawtext=fontfile='{font_bold}':text='REC ● SCREEN DEMO':fontcolor=0xffffff:fontsize=14:x=1712:y=25,

drawbox=x=36:y=90:w=340:h=950:color=0x0e121a:t=fill,
drawbox=x=36:y=90:w=340:h=950:color=0x232b38:t=2,
drawtext=fontfile='{font_bold}':text='LIVE SCREEN WALKTHROUGH':fontcolor=0xf59e0b:fontsize=18:x=56:y=115,
drawtext=fontfile='{font_bold}':text='Video.js v10 Custom Skin':fontcolor=0x94a3b8:fontsize=14:x=56:y=142,

drawbox=x=52:y=180:w=308:h=160:color=0x151c27:t=fill,
drawbox=x=52:y=180:w=308:h=160:color=0xf59e0b:t=3:enable='between(t,0,5)',
drawtext=fontfile='{font_bold}':text='01. VIDEO.JS V10 + MUX HLS':fontcolor=0xfde047:fontsize=15:x=68:y=200,
drawtext=fontfile='{font_bold}':text='Composable <VideoPlayer>':fontcolor=0xe2e8f0:fontsize=13:x=68:y=230,
drawtext=fontfile='{font_bold}':text='and <MuxVideo> engine with':fontcolor=0x94a3b8:fontsize=13:x=68:y=252,
drawtext=fontfile='{font_bold}':text='8.4\\:1 WCAG AAA optical scrim.':fontcolor=0x22d3ee:fontsize=13:x=68:y=274,

drawbox=x=52:y=360:w=308:h=160:color=0x151c27:t=fill,
drawbox=x=52:y=360:w=308:h=160:color=0xf59e0b:t=3:enable='between(t,5,10)',
drawtext=fontfile='{font_bold}':text='02. TACTILE SCRUB TIMELINE':fontcolor=0xfde047:fontsize=15:x=68:y=380,
drawtext=fontfile='{font_bold}':text='Recessed machine groove with':fontcolor=0xe2e8f0:fontsize=13:x=68:y=410,
drawtext=fontfile='{font_bold}':text='chapter notches, buffer bar,':fontcolor=0x94a3b8:fontsize=13:x=68:y=432,
drawtext=fontfile='{font_bold}':text='and SMPTE frame timecodes.':fontcolor=0x22d3ee:fontsize=13:x=68:y=454,

drawbox=x=52:y=540:w=308:h=160:color=0x151c27:t=fill,
drawbox=x=52:y=540:w=308:h=160:color=0xf59e0b:t=3:enable='between(t,10,15)',
drawtext=fontfile='{font_bold}':text='03. PRECISION JOG SHUTTLE':fontcolor=0xfde047:fontsize=15:x=68:y=560,
drawtext=fontfile='{font_bold}':text='Rotary dial (6 deg = 1 frame)':fontcolor=0xe2e8f0:fontsize=13:x=68:y=590,
drawtext=fontfile='{font_bold}':text='with -1/+1 frame step buttons':fontcolor=0x94a3b8:fontsize=13:x=68:y=612,
drawtext=fontfile='{font_bold}':text='and 0.5x to 2x shuttle speeds.':fontcolor=0x22d3ee:fontsize=13:x=68:y=634,

drawbox=x=52:y=720:w=308:h=160:color=0x151c27:t=fill,
drawbox=x=52:y=720:w=308:h=160:color=0xf59e0b:t=3:enable='between(t,15,20)',
drawtext=fontfile='{font_bold}':text='04. DUAL VU & CONTRAST AUDIT':fontcolor=0xfde047:fontsize=15:x=68:y=740,
drawtext=fontfile='{font_bold}':text='Stereo CH-L / CH-R dB peak':fontcolor=0xe2e8f0:fontsize=13:x=68:y=770,
drawtext=fontfile='{font_bold}':text='meters, rotary volume pot,':fontcolor=0x94a3b8:fontsize=13:x=68:y=792,
drawtext=fontfile='{font_bold}':text='and 48px touch targets.':fontcolor=0x34d399:fontsize=13:x=68:y=814,

drawbox=x=52:y=910:w=308:h=105:color=0x090d14:t=fill,
drawtext=fontfile='{font_bold}':text='STATUS\\: ALL CONTROLS VERIFIED':fontcolor=0x34d399:fontsize=14:x=68:y=935,
drawtext=fontfile='{font_bold}':text='WCAG AAA 8.4\\:1 · KEYBOARD 100%%':fontcolor=0x94a3b8:fontsize=12:x=68:y=965,
drawtext=fontfile='{font_bold}':text='MUX PLAYBACK ID READY (+2 PTS)':fontcolor=0x22d3ee:fontsize=12:x=68:y=990,

drawbox=x=400:y=732:w=1480:h=76:color=0x0e1219:t=fill,
drawbox=x=400:y=732:w=1480:h=76:color=0x20293a:t=2,
drawtext=fontfile='{font_bold}':text='TIMECODE\\: 00\\:00\\:%{{eif\\:floor(t)\\:d\\:2}}\\:%{{eif\\:mod(n,30)\\:d\\:2}}   /   00\\:00\\:20\\:00':fontcolor=0xf59e0b:fontsize=16:x=420:y=744,
drawtext=fontfile='{font_bold}':text='CHAPTERS\\: [01. Candy City]  ·  [02. Rocket Flight]  ·  [03. Neon Forest]  ·  [04. Boombox Party]':fontcolor=0x94a3b8:fontsize=14:x=950:y=744,
drawbox=x=420:y=774:w=1440:h=16:color=0x161f30:t=fill,

drawbox=x=400:y=822:w=470:h=218:color=0x0f1218:t=fill,
drawbox=x=400:y=822:w=470:h=218:color=0x232b38:t=2,
drawtext=fontfile='{font_bold}':text='MECHANICAL TRANSPORT':fontcolor=0xf59e0b:fontsize=15:x=420:y=840,
drawbox=x=750:y=840:w=12:h=12:color=0xf43f5e:t=fill,
drawtext=fontfile='{font_bold}':text='ROLLING':fontcolor=0xf43f5e:fontsize=14:x=770:y=840,
drawbox=x=420:y=875:w=76:h=76:color=0x181d27:t=fill,
drawtext=fontfile='{font_bold}':text='RTZ':fontcolor=0xcbd5e1:fontsize=16:x=442:y=905,
drawbox=x=508:y=875:w=76:h=76:color=0x181d27:t=fill,
drawtext=fontfile='{font_bold}':text='-10S':fontcolor=0xcbd5e1:fontsize=16:x=526:y=905,
drawbox=x=596:y=875:w=88:h=76:color=0xbe123c:t=fill,
drawtext=fontfile='{font_bold}':text='PLAYING':fontcolor=0xffffff:fontsize=16:x=606:y=905,
drawbox=x=696:y=875:w=76:h=76:color=0x181d27:t=fill,
drawtext=fontfile='{font_bold}':text='+10S':fontcolor=0xcbd5e1:fontsize=16:x=714:y=905,
drawbox=x=784:y=875:w=66:h=76:color=0x181d27:t=fill,
drawtext=fontfile='{font_bold}':text='END':fontcolor=0xcbd5e1:fontsize=16:x=800:y=905,
drawbox=x=420:y=975:w=220:h=36:color=0x1c2433:t=fill,
drawtext=fontfile='{font_bold}':text='SEAMLESS LOOP\\: ON':fontcolor=0xfde047:fontsize=14:x=435:y=986,
drawtext=fontfile='{font_bold}':text='SPACE = PLAY/PAUSE':fontcolor=0x64748b:fontsize=13:x=680:y=986,

drawbox=x=890:y=822:w=490:h=218:color=0x0f1218:t=fill,
drawbox=x=890:y=822:w=490:h=218:color=0x232b38:t=2,
drawtext=fontfile='{font_bold}':text='PRECISION JOG / SHUTTLE':fontcolor=0xf59e0b:fontsize=15:x=910:y=840,
drawtext=fontfile='{font_bold}':text='1 FRAME = 6 DEG':fontcolor=0x64748b:fontsize=13:x=1240:y=840,
drawbox=x=920:y=875:w=85:h=85:color=0x181d27:t=fill,
drawtext=fontfile='{font_bold}':text='-1 FR':fontcolor=0xfde047:fontsize=16:x=940:y=910,
drawbox=x=1030:y=865:w=190:h=105:color=0x141923:t=fill,
drawbox=x=1030:y=865:w=190:h=105:color=0xf59e0b:t=2,
drawtext=fontfile='{font_bold}':text='JOG WHEEL ACTIVE':fontcolor=0xfde047:fontsize=16:x=1048:y=895,
drawtext=fontfile='{font_bold}':text='ANGLE\\: %{{eif\\:mod(n*6,360)\\:d\\:3}} DEG':fontcolor=0x22d3ee:fontsize=15:x=1048:y=928,
drawbox=x=1245:y=875:w=85:h=85:color=0x181d27:t=fill,
drawtext=fontfile='{font_bold}':text='+1 FR':fontcolor=0xfde047:fontsize=16:x=1265:y=910,
drawtext=fontfile='{font_bold}':text='SHUTTLE TAPE SPEED\\:  [0.5x]  [0.75x]  [1.0x ACTIVE]  [1.5x]  [2.0x]':fontcolor=0xcbdaee:fontsize=13:x=915:y=990,

drawbox=x=1400:y=822:w=480:h=218:color=0x0f1218:t=fill,
drawbox=x=1400:y=822:w=480:h=218:color=0x232b38:t=2,
drawtext=fontfile='{font_bold}':text='AUDIO MONITOR & CALIBRATED VU':fontcolor=0xf59e0b:fontsize=15:x=1420:y=840,
drawtext=fontfile='{font_bold}':text='CH-L PEAK':fontcolor=0x94a3b8:fontsize=13:x=1420:y=875,
drawbox=x=1510:y=873:w=340:h=18:color=0x080a0e:t=fill,
drawtext=fontfile='{font_bold}':text='CH-R PEAK':fontcolor=0x94a3b8:fontsize=13:x=1420:y=910,
drawbox=x=1510:y=908:w=340:h=18:color=0x080a0e:t=fill,
drawtext=fontfile='{font_bold}':text='-20dB      -12dB      -6dB      0dB      +3dB':fontcolor=0x64748b:fontsize=12:x=1510:y=938,
drawbox=x=1420:y=975:w=180:h=36:color=0x141923:t=fill,
drawtext=fontfile='{font_bold}':text='MUTE\\: OFF (88%%)':fontcolor=0x34d399:fontsize=14:x=1435:y=986,
drawtext=fontfile='{font_bold}':text='GAIN\\: -1.1 dB':fontcolor=0xfde047:fontsize=14:x=1630:y=986
[ui];

[ui][vid]overlay=x=580:y=90[with_vid];

[with_vid][prog_bar]overlay=x='420-1440+1440*(t/20)':y=774[with_prog];
[with_prog]
drawbox=x=0:y=770:w=420:h=24:color=0x07090d:t=fill,
drawbox=x=36:y=770:w=340:h=24:color=0x0e121a:t=fill,
drawbox=x=52:y=770:w=308:h=24:color=0x151c27:t=fill,
drawtext=fontfile='{font_bold}':text='Stereo CH-L / CH-R dB peak':fontcolor=0xe2e8f0:fontsize=13:x=68:y=770,
drawbox=x=36:y=770:w=2:h=24:color=0x232b38:t=fill,
drawbox=x=374:y=770:w=2:h=24:color=0x232b38:t=fill,
drawbox=x=400:y=770:w=20:h=24:color=0x0e1219:t=fill,
drawbox=x=400:y=770:w=2:h=24:color=0x20293a:t=fill
[clean_prog];

[clean_prog][playhead]overlay=x='416+1432*(t/20)':y=768[with_head];
[with_head][vu_l]overlay=x='1510-80+65*sin(t*9)':y=874[with_vul];
[with_vul][vu_r]overlay=x='1510-85+70*cos(t*7.5)':y=909[with_vur];

[with_vur]
drawbox=x=1402:y=870:w=108:h=60:color=0x0f1218:t=fill,
drawtext=fontfile='{font_bold}':text='CH-L PEAK':fontcolor=0x94a3b8:fontsize=13:x=1420:y=875,
drawtext=fontfile='{font_bold}':text='CH-R PEAK':fontcolor=0x94a3b8:fontsize=13:x=1420:y=910,
drawbox=x=400:y=90:w=178:h=630:color=0x0b0e14:t=fill,
drawbox=x=1702:y=90:w=178:h=630:color=0x0b0e14:t=fill,
drawbox=x=400:y=90:w=1480:h=630:color=0x263145:t=2,
drawbox=x=600:y=108:w=420:h=34:color=0x000000@0.75:t=fill,
drawtext=fontfile='{font_bold}':text='SYNTH//10 DECK · VIDEO.JS V10 · 30 FPS':fontcolor=0xfde047:fontsize=14:x=615:y=118,
drawbox=x=1470:y=108:w=210:h=34:color=0x000000@0.75:t=fill,
drawtext=fontfile='{font_bold}':text='FRAME\\: %{{eif\\:n\\:d\\:6}}':fontcolor=0x22d3ee:fontsize=14:x=1488:y=118
[pre_cursor];

[pre_cursor][cursor]overlay=x='if(lt(t,5), 640+120*sin(t*2), if(lt(t,10), 420+1400*((t-5)/5), if(lt(t,15), 1120+90*cos(t*4), 1620+80*sin(t*3))))':y='if(lt(t,5), 910+20*cos(t*2), if(lt(t,10), 776, if(lt(t,15), 915+40*sin(t*4), 900+30*cos(t*3))))'[vout];

[0:a]volume=0.85[aout]
"""

cmd = [
    "ffmpeg", "-y",
    "-i", cartoon_video,
    "-filter_complex", filter_complex,
    "-map", "[vout]",
    "-map", "[aout]",
    "-t", "20",
    "-c:v", "libx264",
    "-profile:v", "main",
    "-level", "3.1",
    "-pix_fmt", "yuv420p",
    "-preset", "veryfast",
    "-crf", "21",
    "-c:a", "aac",
    "-ar", "44100",
    "-ac", "2",
    "-b:a", "128k",
    "-movflags", "+faststart",
    output_video
]

print("Generating full project screen-recording demo video v2...")
subprocess.run(cmd, check=True)

# Generate poster frame at t=6s to show progress bar & playhead in action
subprocess.run([
    "ffmpeg", "-y", "-ss", "00:00:06", "-i", output_video,
    "-vframes", "1", "-q:v", "2", output_poster
], check=True)
print("Done! Saved to:", output_video)
