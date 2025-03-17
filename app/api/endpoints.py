@app.post("/v1/tts")
async def text_to_speech(
    request: TTSRequest  # 包含text/voice/format等参数
):
    try:
        # 1. 路由选择引擎
        router = TTSEngineRouter()
        engine = router.select_engine({
            'language': detect_language(request.text),
            'budget': request.budget
        })
        
        # 2. 生成原始音频
        raw_audio = engine.synthesize(request.text, {
            'speed': request.speed,
            'pitch': request.pitch,
            'voice': request.voice
        })
        
        # 3. 音频后处理
        processor = AudioProcessor()
        processed = processor.normalize_audio(raw_audio)
        output = processor.convert_format(processed, request.format)
        
        # 4. 缓存与返回
        cache.set(request.cache_key, output, ex=3600)
        return StreamingResponse(
            io.BytesIO(output),
            media_type=f"audio/{request.format}"
        )
    except ProviderLimitExceeded:
        return JSONResponse(
            status_code=429,
            content={"error": "API rate limit exceeded"}
        )

def calculate_cost(provider, text_length):
    pricing = {
        'azure': 0.0004,  # 每字符
        'elevenlabs': 0.0012,
        'edge': 0.0
    }
    return pricing[provider] * len(text)

def select_optimal_provider(text, requirements):
    candidates = []
    for provider in available_providers:
        if meets_requirements(provider, requirements):
            cost = calculate_cost(provider, len(text))
            candidates.append((provider, cost))
    
    return min(candidates, key=lambda x: x[1])[0]

@app.post("/stream-tts")
async def stream_tts(text: str):
    async def audio_generator():
        engine = get_engine('edge')
        async for chunk in engine.stream_synthesize(text):
            yield chunk
    
    return StreamingResponse(
        audio_generator(),
        media_type="audio/mpeg"
    ) 