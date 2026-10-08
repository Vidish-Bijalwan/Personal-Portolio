import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as briefPOST } from '../../../../app/api/create/brief/route';
import { POST as revisePOST } from '../../../../app/api/create/revise/route';
import { compileBrief } from '../intent-compiler';

function post(handler: (req: NextRequest) => Promise<Response>, body: unknown) {
  return handler(
    new NextRequest('http://localhost/api/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  );
}

describe('POST /api/create/brief', () => {
  it('400 on missing instruction', async () => {
    const res = await post(briefPOST, { primary: null, references: [] });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTypeOf('string');
  });

  it('400 on empty instruction', async () => {
    const res = await post(briefPOST, { instruction: '   ', primary: null });
    expect(res.status).toBe(400);
  });

  it('400 on invalid primary shape', async () => {
    const res = await post(briefPOST, {
      instruction: 'a poster',
      primary: { kind: 'image' },
      references: [],
    });
    expect(res.status).toBe(400);
  });

  it('200 + brief shape on valid input', async () => {
    const res = await post(briefPOST, {
      instruction: 'a retro collage poster, darker',
      primary: null,
      references: [],
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.brief.version).toBe(1);
    expect(json.brief.taskType).toBe('image-generate');
    expect(json.brief.visualFamily).toBe('retro collage');
    expect(json.brief.modifiers).toContain('darker');
  });

  it('accepts references without the references key', async () => {
    const res = await post(briefPOST, { instruction: 'a poster', primary: null });
    expect(res.status).toBe(200);
  });
});

describe('POST /api/create/revise', () => {
  const brief = compileBrief({
    instruction: 'a cinematic poster',
    primary: null,
    references: [],
  });

  it('400 on missing brief', async () => {
    const res = await post(revisePOST, { instruction: 'darker' });
    expect(res.status).toBe(400);
  });

  it('400 on missing instruction', async () => {
    const res = await post(revisePOST, { brief });
    expect(res.status).toBe(400);
  });

  it('200 + targeted patch', async () => {
    const res = await post(revisePOST, { brief, instruction: 'darker' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.brief.modifiers).toContain('darker');
    expect(json.brief.taskType).toBe(brief.taskType);
    expect(json.brief.visualFamily).toBe(brief.visualFamily);
  });
});
