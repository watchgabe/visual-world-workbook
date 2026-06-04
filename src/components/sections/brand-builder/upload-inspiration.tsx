'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import { MODULE_SECTIONS } from '@/lib/modules'
import { saveField } from '@/lib/saveField'

const MODULE_SLUG = 'brand-builder' as const
const SECTION_INDEX = 0
const SECTION_DEF = MODULE_SECTIONS['brand-builder']![SECTION_INDEX]

const BUCKET = 'mood-board'

type FormValues = {
  bb_inspo_images: string
  bb_inspo_notes: string
}

export default function UploadInspirationSection() {
  const { user } = useAuth()
  const { watch, setValue } = useForm<FormValues>({
    defaultValues: { bb_inspo_images: '', bb_inspo_notes: '' },
  })

  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Compress image before upload
  const compress = useCallback(async (file: File | Blob): Promise<Blob> => {
    const bitmap = await createImageBitmap(file)
    const MAX = 1200
    let { width, height } = bitmap
    if (width > MAX || height > MAX) {
      if (width >= height) { height = Math.round(height * MAX / width); width = MAX }
      else { width = Math.round(width * MAX / height); height = MAX }
    }
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
    return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.85))
  }, [])

  // Save image list to Supabase
  const persistImages = useCallback((imgs: string[]) => {
    if (!user) return
    const json = JSON.stringify(imgs)
    setValue('bb_inspo_images', json)
    saveField(user.id, MODULE_SLUG, 'bb_inspo_images', json)
  }, [user, setValue])

  // Load existing data
  useEffect(() => {
    if (!user) return
    let cancelled = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(createClient() as any)
      .from('blp_responses')
      .select('responses')
      .eq('user_id', user.id)
      .eq('module_slug', MODULE_SLUG)
      .maybeSingle()
      .then(({ data }: { data: { responses: Record<string, string> } | null }) => {
        if (cancelled || !data?.responses) return
        const r = data.responses
        if (r.bb_inspo_notes) setValue('bb_inspo_notes', r.bb_inspo_notes)
        if (r.bb_inspo_images) {
          try {
            const parsed = JSON.parse(r.bb_inspo_images)
            if (Array.isArray(parsed)) setImages(parsed)
          } catch { /* ignore */ }
        }
      })
    return () => { cancelled = true }
  }, [user, setValue])

  // Upload files
  async function uploadFiles(files: File[]) {
    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    if (!imageFiles.length || !user) return
    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of imageFiles.slice(0, 15)) {
      try {
        const compressed = await compress(file)
        const path = `${user.id}/brand-builder/${crypto.randomUUID()}.jpg`
        const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
          contentType: 'image/jpeg',
          upsert: false,
        })
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
          newUrls.push(publicUrl)
        }
      } catch { /* skip */ }
    }

    const next = [...images, ...newUrls].slice(0, 15)
    setImages(next)
    persistImages(next)
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    uploadFiles(Array.from(e.dataTransfer.files))
  }

  function removeImage(idx: number) {
    const next = images.filter((_, i) => i !== idx)
    setImages(next)
    persistImages(next)
  }

  const responses = watch()

  return (
    <SectionWrapper
      moduleSlug={MODULE_SLUG}
      sectionIndex={SECTION_INDEX}
      fields={SECTION_DEF.fields}
      responses={responses}
    >
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '.5rem' }}>
        Brand Builder — Step 1
      </div>
      <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: '1rem' }}>
        Upload Your Inspiration
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--dim)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
        Before any design decisions, you need a visual reference point. Upload 6–15 screenshots, frames, posts, thumbnails, or images that feel like your brand. Don't overthink it — just collect things that make you feel something.
      </p>

      <div
        style={{
          background: 'var(--orange-tint)',
          border: '1px solid var(--orange-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '13px',
          color: 'var(--text)',
          lineHeight: 1.7,
        }}
      >
        <strong>Where to look:</strong> Screenshot thumbnails from creators you admire. Frames from films or ads. Instagram posts that stop your scroll. Font references you save. Color combinations that feel right. Anything goes — the AI will find the patterns.
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: dragOver ? '2px solid var(--orange)' : '2px dashed var(--border2)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'var(--orange-tint)' : 'var(--surface)',
          transition: 'all .15s',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.6 }}>↑</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
          {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--dimmer)' }}>
          JPG, PNG, WEBP — up to 15 images
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => { uploadFiles(Array.from(e.target.files || [])); e.target.value = '' }}
        />
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)' }}>
              Your Board — {images.length} image{images.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={() => { setImages([]); persistImages([]) }}
              style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--dimmer)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font)', padding: 0 }}
            >
              Clear all
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
            {images.map((src, i) => (
              <div
                key={i}
                style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '1', background: 'var(--surface)', border: '1px solid var(--border)' }}
                className="bb-thumb"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button
                  onClick={e => { e.stopPropagation(); removeImage(i) }}
                  style={{
                    position: 'absolute', top: '4px', right: '4px',
                    background: 'rgba(0,0,0,.7)', color: '#fff',
                    border: 'none', borderRadius: '50%',
                    width: '18px', height: '18px', cursor: 'pointer',
                    fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  }}
                >×</button>
              </div>
            ))}
            {images.length < 15 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  aspectRatio: '1', border: '1px dashed var(--border2)', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--dimmer)', fontSize: '20px', transition: 'all .15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--orange)'; (e.currentTarget as HTMLElement).style.color = 'var(--orange)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.color = 'var(--dimmer)' }}
              >+</div>
            )}
          </div>
        </div>
      )}

      {/* Notes field */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--dim)', marginBottom: '6px' }}>
          Anything we should know about these references? (optional)
        </label>
        <textarea
          value={responses.bb_inspo_notes}
          onChange={e => setValue('bb_inspo_notes', e.target.value)}
          onBlur={e => { if (user) saveField(user.id, MODULE_SLUG, 'bb_inspo_notes', e.target.value) }}
          placeholder="e.g. I love the muted tones here. The contrast in the third image is exactly my vibe. These thumbnails all feel premium without being stuffy."
          rows={3}
          style={{
            width: '100%', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)',
            borderRadius: 'var(--radius-md)', padding: '9px 12px', fontSize: '13px',
            fontFamily: 'var(--font)', color: 'var(--text)', background: 'var(--surface)',
            lineHeight: 1.5, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
          }}
        />
      </div>

      {images.length >= 6 && (
        <div style={{ fontSize: '12px', color: 'var(--green-text)', fontWeight: 600, marginTop: '.5rem' }}>
          Nice — {images.length} images is enough to generate brand directions. Head to Brand Intent next.
        </div>
      )}
    </SectionWrapper>
  )
}
