/**
 * @jest-environment node
 */
import { aProduct } from '@/test/fixtures';

import { CHOICE_FIELDS, configure, preview, readChoice } from './configuration';

const product = aProduct();

function formWith(fields: Record<string, string | Blob>) {
  const formData = new FormData();

  for (const [name, value] of Object.entries(fields)) {
    formData.append(name, value);
  }

  return formData;
}

describe('configure', () => {
  it('turns a complete choice into its price and its picture', () => {
    expect(configure(product, { color: 'Titanium Violet', storage: '512 GB' })).toEqual({
      color: 'Titanium Violet',
      storage: '512 GB',
      price: 1349,
      imageUrl: 'https://example.com/violet.webp',
    });
  });

  it('prices by storage and pictures by colour, whatever the combination', () => {
    for (const color of product.colorOptions) {
      for (const storage of product.storageOptions) {
        expect(configure(product, { color: color.name, storage: storage.capacity })).toEqual({
          color: color.name,
          storage: storage.capacity,
          price: storage.price,
          imageUrl: color.imageUrl,
        });
      }
    }
  });

  it.each([
    ['nothing has been chosen', {}],
    ['the colour is missing', { storage: '512 GB' }],
    ['the storage is missing', { color: 'Titanium Violet' }],
    ['the product does not come in that colour', { color: 'Titanium Blue', storage: '512 GB' }],
    ['the product does not offer that storage', { color: 'Titanium Violet', storage: '2 TB' }],
    ['the colour differs only in case', { color: 'titanium violet', storage: '512 GB' }],
    ['the storage carries stray whitespace', { color: 'Titanium Violet', storage: ' 512 GB' }],
  ])('has nothing to offer when %s', (_, choice) => {
    expect(configure(product, choice)).toBeNull();
  });

  it('has nothing to offer for a product without colours or without storage', () => {
    const choice = { color: 'Titanium Violet', storage: '512 GB' };

    expect(configure(aProduct({ colorOptions: [] }), choice)).toBeNull();
    expect(configure(aProduct({ storageOptions: [] }), choice)).toBeNull();
  });

  it('matches option names that need escaping exactly as they are', () => {
    const awkward = aProduct({
      colorOptions: [
        {
          name: 'Azul "Pacífico" / 2024',
          hexCode: '#1C3D5A',
          imageUrl: 'https://example.com/a.webp',
        },
      ],
      storageOptions: [{ capacity: '128 GB + 1 TB microSD', price: 999 }],
    });

    expect(
      configure(awkward, { color: 'Azul "Pacífico" / 2024', storage: '128 GB + 1 TB microSD' }),
    ).toEqual({
      color: 'Azul "Pacífico" / 2024',
      storage: '128 GB + 1 TB microSD',
      price: 999,
      imageUrl: 'https://example.com/a.webp',
    });
  });
});

describe('preview', () => {
  it('starts from the base price and the first colour while nothing is chosen', () => {
    expect(preview(product, {})).toEqual({
      price: 1229,
      isStartingPrice: true,
      imageUrl: 'https://example.com/black.webp',
    });
  });

  it('shows the price of the chosen storage', () => {
    expect(preview(product, { storage: '1 TB' })).toEqual({
      price: 1589,
      isStartingPrice: false,
      imageUrl: 'https://example.com/black.webp',
    });
  });

  it('shows the picture of the chosen colour, keeping the starting price', () => {
    expect(preview(product, { color: 'Titanium Yellow' })).toEqual({
      price: 1229,
      isStartingPrice: true,
      imageUrl: 'https://example.com/yellow.webp',
    });
  });

  it('shows both once both are chosen', () => {
    expect(preview(product, { color: 'Titanium Violet', storage: '512 GB' })).toEqual({
      price: 1349,
      isStartingPrice: false,
      imageUrl: 'https://example.com/violet.webp',
    });
  });

  it('treats options the product does not have as not chosen', () => {
    expect(preview(product, { color: 'Titanium Blue', storage: '2 TB' })).toEqual({
      price: 1229,
      isStartingPrice: true,
      imageUrl: 'https://example.com/black.webp',
    });
  });

  it('has no picture for a product without colours', () => {
    expect(preview(aProduct({ colorOptions: [] }), {}).imageUrl).toBeUndefined();
  });

  it('can only show the starting price for a product without storage', () => {
    expect(preview(aProduct({ storageOptions: [] }), { storage: '512 GB' })).toEqual(
      expect.objectContaining({ price: 1229, isStartingPrice: true }),
    );
  });
});

describe('readChoice', () => {
  it('reads back a choice sent under the agreed field names', () => {
    const sent = formWith({
      [CHOICE_FIELDS.color]: 'Titanium Violet',
      [CHOICE_FIELDS.storage]: '512 GB',
    });

    expect(readChoice(sent)).toEqual({ color: 'Titanium Violet', storage: '512 GB' });
  });

  it('keeps values exactly as they were sent', () => {
    const sent = formWith({
      [CHOICE_FIELDS.color]: ' Azul "Pacífico" / 2024 ',
      [CHOICE_FIELDS.storage]: '128 GB + 1 TB microSD',
    });

    expect(readChoice(sent)).toEqual({
      color: ' Azul "Pacífico" / 2024 ',
      storage: '128 GB + 1 TB microSD',
    });
  });

  it.each([
    ['missing', {}],
    ['empty', { [CHOICE_FIELDS.color]: '', [CHOICE_FIELDS.storage]: '' }],
    [
      'files instead of text',
      {
        [CHOICE_FIELDS.color]: new Blob(['Titanium Violet']),
        [CHOICE_FIELDS.storage]: new Blob(['512 GB']),
      },
    ],
  ])('leaves out fields that are %s', (_, fields) => {
    expect(readChoice(formWith(fields))).toEqual({ color: undefined, storage: undefined });
  });

  it('ignores fields that are not part of a choice', () => {
    const sent = formWith({ [CHOICE_FIELDS.storage]: '512 GB', price: '1', productId: 'OTHER' });

    expect(readChoice(sent)).toEqual({ color: undefined, storage: '512 GB' });
  });

  it('takes the first value when a field is sent twice', () => {
    const sent = new FormData();
    sent.append(CHOICE_FIELDS.storage, '512 GB');
    sent.append(CHOICE_FIELDS.storage, '1 TB');

    expect(readChoice(sent).storage).toBe('512 GB');
  });
});
