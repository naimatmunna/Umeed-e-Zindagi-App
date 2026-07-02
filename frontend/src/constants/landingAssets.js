const byNumber = (path) => Number(path.match(/\((\d+)\)/)?.[1] ?? path.match(/(\d+)/)?.[1] ?? 0);

const hospitalModules = import.meta.glob('../assets/hostpital*.jpeg', { eager: true, import: 'default' });
const certificateModules = import.meta.glob('../assets/certifciates/*.{jpeg,jpg,png,webp}', {
  eager: true,
  import: 'default',
});

export const hospitalImages = Object.entries(hospitalModules)
  .sort(([a], [b]) => byNumber(a) - byNumber(b))
  .map(([, src]) => src);

export const certificateImages = Object.values(certificateModules);

export const heroImage = hospitalImages[0] ?? null;
export const aboutImage = hospitalImages[1] ?? hospitalImages[0] ?? null;
