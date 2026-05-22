import React, { useState, useEffect, useRef, useCallback } from 'react';
import { uploadTenantBranding, getBrandingStatus, updateTenantSettings } from '../api/tenant';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const DEFAULT_COLORS = { primary: '#1976d2', secondary: '#dc004e', accent: '#ff9800', background: '#f5f5f5', text: '#333333' };

const ColorRow = ({ label, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0' }}>
    <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: color, marginRight: 8, border: '1px solid #ccc' }} />
    <span style={{ fontSize: 14, fontFamily: 'monospace' }}>{label}: {color}</span>
  </div>
);

const SitePreview = ({ colors, logoUrl }) => (
  <div style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', maxWidth: 400, marginTop: 16 }}>
    <div style={{ backgroundColor: colors.primary, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      {logoUrl ? <img src={logoUrl} alt="Logo" style={{ height: 40 }} /> : <div style={{ width: 40, height: 40, backgroundColor: '#fff', borderRadius: 4 }} />}
      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Minha Loja</span>
    </div>
    <div style={{ padding: 16, backgroundColor: colors.background }}>
      <h3 style={{ color: colors.text, margin: '0 0 12px 0' }}>Ofertas</h3>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ height: 80, backgroundColor: colors.accent, borderRadius: 4, marginBottom: 8 }} />
          <p style={{ color: colors.text, margin: 0, fontWeight: 'bold' }}>Produto 1</p>
          <p style={{ color: colors.secondary, margin: 0 }}>R$ 99,90</p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 8, padding: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ height: 80, backgroundColor: colors.accent, borderRadius: 4, marginBottom: 8 }} />
          <p style={{ color: colors.text, margin: 0, fontWeight: 'bold' }}>Produto 2</p>
          <p style={{ color: colors.secondary, margin: 0 }}>R$ 149,90</p>
        </div>
      </div>
    </div>
  </div>
);

const BrandingUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setLogoUrl(null);
    setUploading(false);
    setExtracting(false);
    setColors(DEFAULT_COLORS);
    setError('');
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleFile = (selectedFile) => {
    setError('');
    setStatusMessage('');
    if (!selectedFile) return;
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Formato inválido. Aceito: PNG, JPG, SVG, WebP.');
      return;
    }
    if (selectedFile.size > MAX_SIZE) {
      setError('Arquivo muito grande. Máximo 2MB.');
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleExtractColors = async () => {
  if (!file) return;
  setError('');
  setStatusMessage('');
  setExtracting(true);
  setColors(DEFAULT_COLORS);
  try {
    const { data } = await uploadTenantBranding(file);
    const jobId = data.job_id;
    const logoUrl = data.logo_url;
    let attempts = 0;
    const poll = async () => {
      attempts++;
      try {
        const { data: job } = await getBrandingStatus(jobId);  // ← CORRIGIDO
        if (job.status === 'completed') {
          setColors(job.colors);
          setLogoUrl(job.logo_url);    // ← opcional se quiser salvar a URL final
          setExtracting(false);
          setStatusMessage('Cores extraídas com sucesso!');
        } else if (job.status === 'failed') {
          setExtracting(false);
          setError('Falha na extração. Usando paleta padrão.');
        } else if (attempts >= 15) {
          setExtracting(false);
          setError('Tempo limite excedido. Usando paleta padrão.');
        } else {
          pollRef.current = setTimeout(poll, 2000);
        }
      } catch (pollErr) {
        setExtracting(false);
        setError('Erro no polling: ' + pollErr.message);
      }
    };
    poll();
  } catch (uploadErr) {
    setExtracting(false);
    setError('Erro no upload: ' + uploadErr.message);
  }
};

  const handleApplyColors = async () => {
  try {
    await updateTenantSettings({
      logo_url: logoUrl,
      primary_color: colors.primary,
      secondary_color: colors.secondary,
      accent_color: colors.accent,
      background_color: colors.background,
      text_color: colors.text
    });
    setStatusMessage('Configurações aplicadas com sucesso!');
  } catch (err) {
    setError('Erro ao aplicar: ' + err.message);
  }
};

  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Upload de Branding</h2>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #aaa',
          borderRadius: 8,
          padding: 40,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: preview ? '#f0f0f0' : '#fafafa',
        }}
      >
        {preview ? (
          <img src={preview} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%' }} />
        ) : (
          <p>Arraste sua logo aqui ou clique para selecionar</p>
        )}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {statusMessage && <p style={{ color: 'green' }}>{statusMessage}</p>}
      <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={handleExtractColors} disabled={!file || extracting}>
          {extracting ? 'Extraindo...' : 'Extrair Cores Automaticamente'}
        </button>
        <button onClick={handleApplyColors} disabled={!logoUrl}>
          Aplicar Cores
        </button>
        <button onClick={reset}>
          Regenerar
        </button>
      </div>
      {extracting && <p style={{ marginTop: 8 }}>Aguarde, extraindo cores... (até 30s)</p>}
      <div style={{ marginTop: 16 }}>
        <h3>Cores Extraídas</h3>
        <ColorRow label="Primary" color={colors.primary} />
        <ColorRow label="Secondary" color={colors.secondary} />
        <ColorRow label="Accent" color={colors.accent} />
        <ColorRow label="Background" color={colors.background} />
        <ColorRow label="Text" color={colors.text} />
      </div>
      <SitePreview colors={colors} logoUrl={logoUrl} />
    </div>
  );
};

export default BrandingUpload;