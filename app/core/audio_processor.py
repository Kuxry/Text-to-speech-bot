class AudioProcessor:
    def __init__(self):
        self.ffmpeg_path = "/usr/bin/ffmpeg"
    
    def normalize_audio(self, audio: AudioSegment) -> AudioSegment:
        # 音量标准化
        change_in_dBFS = -20 - audio.dBFS
        normalized = audio.apply_gain(change_in_dBFS)
        
        # 降噪处理
        samples = np.array(normalized.get_array_of_samples())
        cleaned = nr.reduce_noise(y=samples, sr=normalized.frame_rate)
        return AudioSegment(
            cleaned.tobytes(),
            frame_rate=normalized.frame_rate,
            sample_width=normalized.sample_width,
            channels=normalized.channels
        )
    
    def convert_format(self, audio: AudioSegment, format: str) -> bytes:
        # 支持MP3/WAV/OGG转换
        with tempfile.NamedTemporaryFile() as tmp:
            audio.export(tmp.name, format=format)
            return tmp.read() 