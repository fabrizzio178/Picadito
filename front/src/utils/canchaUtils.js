const toStringSafe = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

const toPlainText = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    const candidate =
      value.nombre ??
      value.label ??
      value.descripcion ??
      value.title ??
      value.text ??
      value.value ??
      value.codigo ??
      value.slug ??
      value.id;
    if (candidate !== undefined && candidate !== null) {
      return toPlainText(candidate, fallback);
    }
  }
  return fallback;
};

const slugify = (value) =>
  toPlainText(value)
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .toLowerCase();

const toNumberSafe = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getTipoDisplay = (tipo) => {
  if (tipo === null || tipo === undefined) return "";
  if (typeof tipo === "object") {
    return tipo.nombre ?? tipo.label ?? tipo.descripcion ?? toStringSafe(tipo.id);
  }
  return toStringSafe(tipo);
};

export const getTipoValue = (tipo, fallback = "5") => {
  if (tipo === null || tipo === undefined) return fallback;
  if (typeof tipo === "object") {
    if (tipo.id) return String(tipo.id);
    const fromName = tipo.nombre?.match(/\d+/)?.[0];
    if (fromName) return fromName;
    return tipo.value ?? fallback;
  }
  return String(tipo);
};

export const getSurfaceValue = (surface, fallback = "sintetica") => {
  if (surface === null || surface === undefined) return fallback;
  if (typeof surface === "string") return surface;
  if (typeof surface === "object") {
    return slugify(surface.slug ?? surface.codigo ?? surface.value ?? surface.nombre) || fallback;
  }
  return fallback;
};

export const getEstadoValue = (estado, fallback = "activa") => {
  if (estado === null || estado === undefined) return fallback;
  if (typeof estado === "string") return estado;
  if (typeof estado === "object") {
    return slugify(estado.slug ?? estado.codigo ?? estado.nombre ?? estado.estado) || fallback;
  }
  return fallback;
};

export const getSurfaceLabel = (surface) => toPlainText(surface);
export const getEstadoLabel = (estado) => toPlainText(estado);

export const getAmenityLabel = (amenity) => {
  if (!amenity) return "";
  if (typeof amenity === "string") return amenity;
  if (typeof amenity === "object") {
    return amenity.nombre ?? amenity.label ?? amenity.descripcion ?? toStringSafe(amenity.id);
  }
  return toStringSafe(amenity);
};

export const getUbicacionLabel = (ubicacion) => {
  if (!ubicacion) return "";
  if (typeof ubicacion === "string") return ubicacion;
  if (typeof ubicacion === "object") {
    if (ubicacion.nombre) return ubicacion.nombre;
    const parts = [ubicacion.barrio, ubicacion.ciudad, ubicacion.provincia].filter(Boolean);
    if (parts.length) return parts.join(", ");
    return ubicacion.direccion ?? "";
  }
  return toStringSafe(ubicacion);
};

export const normalizeAmenityList = (amenities) => {
  if (!Array.isArray(amenities)) return [];
  return amenities.map((amenity) => getAmenityLabel(amenity)).filter(Boolean);
};

export const normalizeCanchaRecord = (record = {}) => {
  const normalized = {
    ...record,
    tipo: getTipoValue(record.tipo ?? record.formato ?? record.tipoId),
    tipoLabel: getTipoDisplay(record.tipo ?? record.formato),
    superficie: getSurfaceValue(record.superficie ?? record.surface),
    superficieLabel: getSurfaceLabel(record.superficie ?? record.surface ?? record.superficieLabel),
    estado: getEstadoValue(record.estado ?? record.estadoActual ?? record.status),
    estadoLabel: getEstadoLabel(record.estado ?? record.estadoActual ?? record.status),
    amenities: normalizeAmenityList(record.amenities),
    ubicacion: getUbicacionLabel(record.ubicacion) || record.ubicacion || "",
    ubicacionLabel: getUbicacionLabel(record.ubicacion),
    nombre: toPlainText(record.nombre ?? record.name ?? record.titulo ?? ""),
    descripcion: toPlainText(record.descripcion ?? record.description ?? record.detalle ?? ""),
    precioBase: toNumberSafe(record.precioBase ?? record.precio ?? record.precioHora ?? 0, 0),
    duracionTurno: toNumberSafe(record.duracionTurno ?? record.duracion ?? record.duracionMinutos ?? 60, 60)
  };

  return normalized;
};
