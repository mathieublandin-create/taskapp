/**
 * Support des étapes du rang 1 (RC-US022-2) : un groupe capturant au motif de `{appareil}` (préfixes « sur le PC, »,
 * pluriels « (s) ») est déjà converti par cucumber-js ; la conversion doit donc être idempotente, sans quoi
 * « sur le PC, » désignerait le smartphone.
 */
import { describe, expect, it } from 'vitest';
import { convertirAppareil } from '@tests/support/conversions';

describe('Conversions des étapes du rang 1', () => {
  it('UT-COMP-US-022-106 convertirAppareil — idempotente : « pc » et « smartphone » déjà convertis restent inchangés', () => {
    expect(convertirAppareil(convertirAppareil('PC'))).toBe('pc');
    expect(convertirAppareil(convertirAppareil('smartphone'))).toBe('smartphone');
  });
});
