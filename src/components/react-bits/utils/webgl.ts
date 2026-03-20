/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WebGL utility functions for shader compilation and context management
 */

export function hashCode(s: string) {
  if (!s.length) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function addKeywords(source: string, keywords: string[] | null) {
  if (!keywords) return source;
  let keywordsString = "";
  for (const keyword of keywords) {
    keywordsString += `#define ${keyword}\n`;
  }
  return keywordsString + source;
}

export function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string,
  keywords: string[] | null = null,
): WebGLShader | null {
  const shaderSource = addKeywords(source, keywords);
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.trace(gl.getShaderInfoLog(shader));
  }
  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertexShader: WebGLShader | null,
  fragmentShader: WebGLShader | null,
): WebGLProgram | null {
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.trace(gl.getProgramInfoLog(program));
  }
  return program;
}

export function getUniforms(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  program: WebGLProgram,
) {
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < uniformCount; i++) {
    const uniformInfo = gl.getActiveUniform(program, i);
    if (uniformInfo) {
      uniforms[uniformInfo.name] = gl.getUniformLocation(program, uniformInfo.name);
    }
  }
  return uniforms;
}

export function supportRenderTextureFormat(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number,
) {
  const texture = gl.createTexture();
  if (!texture) return false;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

  const fbo = gl.createFramebuffer();
  if (!fbo) return false;

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  return status === gl.FRAMEBUFFER_COMPLETE;
}

export function getSupportedFormat(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number,
): { internalFormat: number; format: number } | null {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    if ("drawBuffers" in gl) {
      const gl2 = gl as WebGL2RenderingContext;
      switch (internalFormat) {
        case gl2.R16F:
          return getSupportedFormat(gl2, gl2.RG16F, gl2.RG, type);
        case gl2.RG16F:
          return getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, type);
        default:
          return null;
      }
    }
    return null;
  }
  return { internalFormat, format };
}

export function getWebGLContext(canvas: HTMLCanvasElement) {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  };

  let gl = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;

  if (!gl) {
    gl = (canvas.getContext("webgl", params) ||
      canvas.getContext("experimental-webgl", params)) as WebGL2RenderingContext | null;
  }

  if (!gl) {
    throw new Error("Unable to initialize WebGL.");
  }

  const isWebGL2 = "drawBuffers" in gl;

  let supportLinearFiltering = false;
  let halfFloat = null;

  if (isWebGL2) {
    (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
    supportLinearFiltering = !!(gl as WebGL2RenderingContext).getExtension(
      "OES_texture_float_linear",
    );
  } else {
    halfFloat = gl.getExtension("OES_texture_half_float");
    supportLinearFiltering = !!gl.getExtension("OES_texture_half_float_linear");
  }

  gl.clearColor(0, 0, 0, 1);

  const halfFloatTexType = isWebGL2
    ? (gl as WebGL2RenderingContext).HALF_FLOAT
    : (halfFloat && (halfFloat as any).HALF_FLOAT_OES) || 0;

  let formatRGBA: any;
  let formatRG: any;
  let formatR: any;

  if (isWebGL2) {
    formatRGBA = getSupportedFormat(
      gl,
      (gl as WebGL2RenderingContext).RGBA16F,
      gl.RGBA,
      halfFloatTexType,
    );
    formatRG = getSupportedFormat(
      gl,
      (gl as WebGL2RenderingContext).RG16F,
      (gl as WebGL2RenderingContext).RG,
      halfFloatTexType,
    );
    formatR = getSupportedFormat(
      gl,
      (gl as WebGL2RenderingContext).R16F,
      (gl as WebGL2RenderingContext).RED,
      halfFloatTexType,
    );
  } else {
    formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
  }

  return {
    gl,
    ext: {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering,
    },
  };
}
