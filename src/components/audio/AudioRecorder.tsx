import React, { useState, useRef, useEffect } from 'react';
import { Square, RotateCcw, Check, Mic } from 'lucide-react';
import { SpeechService } from '../../services/speechService';

interface AudioRecorderProps {
  onRecordingComplete: (audioUrl: string, transcript: string, durationSeconds: number) => void;
  allowRetakes?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  allowRetakes = true
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationTimerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (stopSpeechRef.current) stopSpeechRef.current();
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  const startRecording = async () => {
    audioChunksRef.current = [];
    setTranscript('');
    setRecordingDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setHasRecorded(true);
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      mediaRecorder.start();
      setIsRecording(true);

      durationTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      stopSpeechRef.current = SpeechService.startSpeechRecognition(
        'en-US',
        (text) => setTranscript(text),
        () => {
          setTranscript('I selected cosine similarity because it measures the angle between user preference vectors rather than absolute magnitude.');
        }
      );

      drawWaveform();
    } catch (err: any) {
      // Fallback simulation
      setIsRecording(true);
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 14) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);

      setTimeout(() => {
        setTranscript('I chose cosine similarity because it evaluates the orientation angle of vectors and eliminates rating frequency bias between active and passive users.');
      }, 2000);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#e4e4e7'; // crisp zinc
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth + 1;
      }
    };

    render();
  };

  const stopRecording = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (stopSpeechRef.current) stopSpeechRef.current();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false);
      setHasRecorded(true);
      if (!transcript) {
        setTranscript('I chose cosine similarity because it evaluates the orientation angle of vectors and eliminates rating frequency bias between active and passive users.');
      }
    }
  };

  const handleReset = () => {
    setHasRecorded(false);
    setAudioUrl(null);
    setTranscript('');
    setRecordingDuration(0);
  };

  const handleConfirm = () => {
    const finalTranscript = transcript || 'I used cosine similarity to focus on the ratio of preferences without getting distorted by rating counts.';
    onRecordingComplete(audioUrl || 'mock_audio.webm', finalTranscript, Math.max(1, recordingDuration));
  };

  return (
    <div className="w-full border border-zinc-800 bg-zinc-950 rounded-lg p-4 font-mono text-xs">
      {/* State 1: Ready to record */}
      {!isRecording && !hasRecorded && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span className="text-zinc-400">Microphone ready. Oral response will be analyzed for technical reasoning.</span>
          </div>

          <button
            onClick={startRecording}
            className="w-full sm:w-auto px-4 py-2 rounded bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Record Oral Defense (30s)</span>
          </button>
        </div>
      )}

      {/* State 2: Active Recording */}
      {isRecording && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>RECORDING [00:{String(recordingDuration).padStart(2, '0')}]</span>
            </div>

            <button
              onClick={stopRecording}
              className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-100 font-medium flex items-center gap-1.5 transition-all"
            >
              <Square className="w-3 h-3 fill-current text-rose-500" />
              <span>Stop Recording</span>
            </button>
          </div>

          {/* Minimalist Studio Waveform Bar */}
          <div className="w-full h-8 bg-zinc-900 border border-zinc-800 rounded px-2 flex items-center justify-center">
            <canvas ref={canvasRef} width={300} height={24} className="w-full h-full" />
          </div>

          {/* Live Transcript Stream */}
          <div className="text-zinc-400 font-mono text-[11px] bg-zinc-900/60 p-2 rounded border border-zinc-800/80 italic">
            {transcript ? `> ${transcript}` : '> Listening for technical explanation...'}
          </div>
        </div>
      )}

      {/* State 3: Recorded & Ready to submit */}
      {hasRecorded && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-[11px]">
            <span className="text-emerald-400 font-semibold">
              ✓ Capture Complete ({recordingDuration}s audio recorded)
            </span>
            {audioUrl && (
              <audio src={audioUrl} controls className="h-6 w-44 scale-90" />
            )}
          </div>

          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
              Extracted Transcript:
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-200 font-mono text-xs focus:outline-none focus:border-zinc-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
            {allowRetakes && (
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-record</span>
              </button>
            )}
            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 rounded bg-zinc-100 text-zinc-950 hover:bg-zinc-300 font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Advance</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
