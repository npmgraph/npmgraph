// Source: https://github.com/spdx/license-list-data/blob/main/json/licenses.json
//
// For each license...
// "reference url" is https://spdx.org/licenses/${licenseId}.html
// "details url" is https://spdx.org/licenses/${licenseId}.json

export type SpdxLicenseId = {
  name: string;
  licenseId: string;
  isOsiApproved?: boolean;
  isFsfLibre?: boolean;
  isDeprecatedLicenseId?: boolean;
};

const spdxLicenses: SpdxLicenseId[] = [
  {
    name: 'BSD Zero Clause License',
    licenseId: '0BSD',
    isOsiApproved: true,
  },
  {
    name: 'Attribution Assurance License',
    licenseId: 'AAL',
    isOsiApproved: true,
  },
  {
    name: 'Abstyles License',
    licenseId: 'Abstyles',
  },
  {
    name: 'AdaCore Doc License',
    licenseId: 'AdaCore-doc',
  },
  {
    name: 'Adobe Systems Incorporated Source Code License Agreement',
    licenseId: 'Adobe-2006',
  },
  {
    name: 'Adobe Display PostScript License',
    licenseId: 'Adobe-Display-PostScript',
  },
  {
    name: 'Adobe Glyph List License',
    licenseId: 'Adobe-Glyph',
  },
  {
    name: 'Adobe Utopia Font License',
    licenseId: 'Adobe-Utopia',
  },
  {
    name: 'Amazon Digital Services License',
    licenseId: 'ADSL',
  },
  {
    name: 'Academic Free License v1.1',
    licenseId: 'AFL-1.1',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Academic Free License v1.2',
    licenseId: 'AFL-1.2',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Academic Free License v2.0',
    licenseId: 'AFL-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Academic Free License v2.1',
    licenseId: 'AFL-2.1',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Academic Free License v3.0',
    licenseId: 'AFL-3.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Afmparse License',
    licenseId: 'Afmparse',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'Affero General Public License v1.0',
    licenseId: 'AGPL-1.0',
    isFsfLibre: true,
  },
  {
    name: 'Affero General Public License v1.0 only',
    licenseId: 'AGPL-1.0-only',
  },
  {
    name: 'Affero General Public License v1.0 or later',
    licenseId: 'AGPL-1.0-or-later',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU Affero General Public License v3.0',
    licenseId: 'AGPL-3.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'GNU Affero General Public License v3.0 only',
    licenseId: 'AGPL-3.0-only',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'GNU Affero General Public License v3.0 or later',
    licenseId: 'AGPL-3.0-or-later',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Aladdin Free Public License',
    licenseId: 'Aladdin',
  },
  {
    name: "AMD's plpa_map.c License",
    licenseId: 'AMDPLPA',
  },
  {
    name: 'Apple MIT License',
    licenseId: 'AML',
  },
  {
    name: 'AML glslang variant License',
    licenseId: 'AML-glslang',
  },
  {
    name: 'Academy of Motion Picture Arts and Sciences BSD',
    licenseId: 'AMPAS',
  },
  {
    name: 'ANTLR Software Rights Notice',
    licenseId: 'ANTLR-PD',
  },
  {
    name: 'ANTLR Software Rights Notice with license fallback',
    licenseId: 'ANTLR-PD-fallback',
  },
  {
    name: 'Apache License 1.0',
    licenseId: 'Apache-1.0',
    isFsfLibre: true,
  },
  {
    name: 'Apache License 1.1',
    licenseId: 'Apache-1.1',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Apache License 2.0',
    licenseId: 'Apache-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Adobe Postscript AFM License',
    licenseId: 'APAFML',
  },
  {
    name: 'Adaptive Public License 1.0',
    licenseId: 'APL-1.0',
    isOsiApproved: true,
  },
  {
    name: 'App::s2p License',
    licenseId: 'App-s2p',
  },
  {
    name: 'Apple Public Source License 1.0',
    licenseId: 'APSL-1.0',
    isOsiApproved: true,
  },
  {
    name: 'Apple Public Source License 1.1',
    licenseId: 'APSL-1.1',
    isOsiApproved: true,
  },
  {
    name: 'Apple Public Source License 1.2',
    licenseId: 'APSL-1.2',
    isOsiApproved: true,
  },
  {
    name: 'Apple Public Source License 2.0',
    licenseId: 'APSL-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Arphic Public License',
    licenseId: 'Arphic-1999',
  },
  {
    name: 'Artistic License 1.0',
    licenseId: 'Artistic-1.0',
    isOsiApproved: true,
  },
  {
    name: 'Artistic License 1.0 w/clause 8',
    licenseId: 'Artistic-1.0-cl8',
    isOsiApproved: true,
  },
  {
    name: 'Artistic License 1.0 (Perl)',
    licenseId: 'Artistic-1.0-Perl',
    isOsiApproved: true,
  },
  {
    name: 'Artistic License 2.0',
    licenseId: 'Artistic-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'ASWF Digital Assets License version 1.0',
    licenseId: 'ASWF-Digital-Assets-1.0',
  },
  {
    name: 'ASWF Digital Assets License 1.1',
    licenseId: 'ASWF-Digital-Assets-1.1',
  },
  {
    name: 'Baekmuk License',
    licenseId: 'Baekmuk',
  },
  {
    name: 'Bahyph License',
    licenseId: 'Bahyph',
  },
  {
    name: 'Barr License',
    licenseId: 'Barr',
  },
  {
    name: 'Beerware License',
    licenseId: 'Beerware',
  },
  {
    name: 'Bitstream Charter Font License',
    licenseId: 'Bitstream-Charter',
  },
  {
    name: 'Bitstream Vera Font License',
    licenseId: 'Bitstream-Vera',
  },
  {
    name: 'BitTorrent Open Source License v1.0',
    licenseId: 'BitTorrent-1.0',
  },
  {
    name: 'BitTorrent Open Source License v1.1',
    licenseId: 'BitTorrent-1.1',
    isFsfLibre: true,
  },
  {
    name: 'SQLite Blessing',
    licenseId: 'blessing',
  },
  {
    name: 'Blue Oak Model License 1.0.0',
    licenseId: 'BlueOak-1.0.0',
  },
  {
    name: 'Boehm-Demers-Weiser GC License',
    licenseId: 'Boehm-GC',
  },
  {
    name: 'Borceux license',
    licenseId: 'Borceux',
  },
  {
    name: 'Brian Gladman 3-Clause License',
    licenseId: 'Brian-Gladman-3-Clause',
  },
  {
    name: 'BSD 1-Clause License',
    licenseId: 'BSD-1-Clause',
    isOsiApproved: true,
  },
  {
    name: 'BSD 2-Clause "Simplified" License',
    licenseId: 'BSD-2-Clause',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'BSD 2-Clause FreeBSD License',
    licenseId: 'BSD-2-Clause-FreeBSD',
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'BSD 2-Clause NetBSD License',
    licenseId: 'BSD-2-Clause-NetBSD',
    isFsfLibre: true,
  },
  {
    name: 'BSD-2-Clause Plus Patent License',
    licenseId: 'BSD-2-Clause-Patent',
    isOsiApproved: true,
  },
  {
    name: 'BSD 2-Clause with views sentence',
    licenseId: 'BSD-2-Clause-Views',
  },
  {
    name: 'BSD 3-Clause "New" or "Revised" License',
    licenseId: 'BSD-3-Clause',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'BSD with attribution',
    licenseId: 'BSD-3-Clause-Attribution',
  },
  {
    name: 'BSD 3-Clause Clear License',
    licenseId: 'BSD-3-Clause-Clear',
    isFsfLibre: true,
  },
  {
    name: 'BSD 3-Clause Flex variant',
    licenseId: 'BSD-3-Clause-flex',
  },
  {
    name: 'Hewlett-Packard BSD variant license',
    licenseId: 'BSD-3-Clause-HP',
  },
  {
    name: 'Lawrence Berkeley National Labs BSD variant license',
    licenseId: 'BSD-3-Clause-LBNL',
    isOsiApproved: true,
  },
  {
    name: 'BSD 3-Clause Modification',
    licenseId: 'BSD-3-Clause-Modification',
  },
  {
    name: 'BSD 3-Clause No Military License',
    licenseId: 'BSD-3-Clause-No-Military-License',
  },
  {
    name: 'BSD 3-Clause No Nuclear License',
    licenseId: 'BSD-3-Clause-No-Nuclear-License',
  },
  {
    name: 'BSD 3-Clause No Nuclear License 2014',
    licenseId: 'BSD-3-Clause-No-Nuclear-License-2014',
  },
  {
    name: 'BSD 3-Clause No Nuclear Warranty',
    licenseId: 'BSD-3-Clause-No-Nuclear-Warranty',
  },
  {
    name: 'BSD 3-Clause Open MPI variant',
    licenseId: 'BSD-3-Clause-Open-MPI',
  },
  {
    name: 'BSD 3-Clause Sun Microsystems',
    licenseId: 'BSD-3-Clause-Sun',
  },
  {
    name: 'BSD 4-Clause "Original" or "Old" License',
    licenseId: 'BSD-4-Clause',
    isFsfLibre: true,
  },
  {
    name: 'BSD 4 Clause Shortened',
    licenseId: 'BSD-4-Clause-Shortened',
  },
  {
    name: 'BSD-4-Clause (University of California-Specific)',
    licenseId: 'BSD-4-Clause-UC',
  },
  {
    name: 'BSD 4.3 RENO License',
    licenseId: 'BSD-4.3RENO',
  },
  {
    name: 'BSD 4.3 TAHOE License',
    licenseId: 'BSD-4.3TAHOE',
  },
  {
    name: 'BSD Advertising Acknowledgement License',
    licenseId: 'BSD-Advertising-Acknowledgement',
  },
  {
    name: 'BSD with Attribution and HPND disclaimer',
    licenseId: 'BSD-Attribution-HPND-disclaimer',
  },
  {
    name: 'BSD-Inferno-Nettverk',
    licenseId: 'BSD-Inferno-Nettverk',
  },
  {
    name: 'BSD Protection License',
    licenseId: 'BSD-Protection',
  },
  {
    name: 'BSD Source Code Attribution',
    licenseId: 'BSD-Source-Code',
  },
  {
    name: 'Systemics BSD variant license',
    licenseId: 'BSD-Systemics',
  },
  {
    name: 'Boost Software License 1.0',
    licenseId: 'BSL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Business Source License 1.1',
    licenseId: 'BUSL-1.1',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'bzip2 and libbzip2 License v1.0.5',
    licenseId: 'bzip2-1.0.5',
  },
  {
    name: 'bzip2 and libbzip2 License v1.0.6',
    licenseId: 'bzip2-1.0.6',
  },
  {
    name: 'Computational Use of Data Agreement v1.0',
    licenseId: 'C-UDA-1.0',
  },
  {
    name: 'Cryptographic Autonomy License 1.0',
    licenseId: 'CAL-1.0',
    isOsiApproved: true,
  },
  {
    name: 'Cryptographic Autonomy License 1.0 (Combined Work Exception)',
    licenseId: 'CAL-1.0-Combined-Work-Exception',
    isOsiApproved: true,
  },
  {
    name: 'Caldera License',
    licenseId: 'Caldera',
  },
  {
    name: 'Computer Associates Trusted Open Source License 1.1',
    licenseId: 'CATOSL-1.1',
    isOsiApproved: true,
  },
  {
    name: 'Creative Commons Attribution 1.0 Generic',
    licenseId: 'CC-BY-1.0',
  },
  {
    name: 'Creative Commons Attribution 2.0 Generic',
    licenseId: 'CC-BY-2.0',
  },
  {
    name: 'Creative Commons Attribution 2.5 Generic',
    licenseId: 'CC-BY-2.5',
  },
  {
    name: 'Creative Commons Attribution 2.5 Australia',
    licenseId: 'CC-BY-2.5-AU',
  },
  {
    name: 'Creative Commons Attribution 3.0 Unported',
    licenseId: 'CC-BY-3.0',
  },
  {
    name: 'Creative Commons Attribution 3.0 Austria',
    licenseId: 'CC-BY-3.0-AT',
  },
  {
    name: 'Creative Commons Attribution 3.0 Germany',
    licenseId: 'CC-BY-3.0-DE',
  },
  {
    name: 'Creative Commons Attribution 3.0 IGO',
    licenseId: 'CC-BY-3.0-IGO',
  },
  {
    name: 'Creative Commons Attribution 3.0 Netherlands',
    licenseId: 'CC-BY-3.0-NL',
  },
  {
    name: 'Creative Commons Attribution 3.0 United States',
    licenseId: 'CC-BY-3.0-US',
  },
  {
    name: 'Creative Commons Attribution 4.0 International',
    licenseId: 'CC-BY-4.0',
    isFsfLibre: true,
  },
  {
    name: 'Creative Commons Attribution Non Commercial 1.0 Generic',
    licenseId: 'CC-BY-NC-1.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial 2.0 Generic',
    licenseId: 'CC-BY-NC-2.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial 2.5 Generic',
    licenseId: 'CC-BY-NC-2.5',
  },
  {
    name: 'Creative Commons Attribution Non Commercial 3.0 Unported',
    licenseId: 'CC-BY-NC-3.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial 3.0 Germany',
    licenseId: 'CC-BY-NC-3.0-DE',
  },
  {
    name: 'Creative Commons Attribution Non Commercial 4.0 International',
    licenseId: 'CC-BY-NC-4.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial No Derivatives 1.0 Generic',
    licenseId: 'CC-BY-NC-ND-1.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial No Derivatives 2.0 Generic',
    licenseId: 'CC-BY-NC-ND-2.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial No Derivatives 2.5 Generic',
    licenseId: 'CC-BY-NC-ND-2.5',
  },
  {
    name: 'Creative Commons Attribution Non Commercial No Derivatives 3.0 Unported',
    licenseId: 'CC-BY-NC-ND-3.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial No Derivatives 3.0 Germany',
    licenseId: 'CC-BY-NC-ND-3.0-DE',
  },
  {
    name: 'Creative Commons Attribution Non Commercial No Derivatives 3.0 IGO',
    licenseId: 'CC-BY-NC-ND-3.0-IGO',
  },
  {
    name: 'Creative Commons Attribution Non Commercial No Derivatives 4.0 International',
    licenseId: 'CC-BY-NC-ND-4.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial Share Alike 1.0 Generic',
    licenseId: 'CC-BY-NC-SA-1.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial Share Alike 2.0 Generic',
    licenseId: 'CC-BY-NC-SA-2.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial Share Alike 2.0 Germany',
    licenseId: 'CC-BY-NC-SA-2.0-DE',
  },
  {
    name: 'Creative Commons Attribution-NonCommercial-ShareAlike 2.0 France',
    licenseId: 'CC-BY-NC-SA-2.0-FR',
  },
  {
    name: 'Creative Commons Attribution Non Commercial Share Alike 2.0 England and Wales',
    licenseId: 'CC-BY-NC-SA-2.0-UK',
  },
  {
    name: 'Creative Commons Attribution Non Commercial Share Alike 2.5 Generic',
    licenseId: 'CC-BY-NC-SA-2.5',
  },
  {
    name: 'Creative Commons Attribution Non Commercial Share Alike 3.0 Unported',
    licenseId: 'CC-BY-NC-SA-3.0',
  },
  {
    name: 'Creative Commons Attribution Non Commercial Share Alike 3.0 Germany',
    licenseId: 'CC-BY-NC-SA-3.0-DE',
  },
  {
    name: 'Creative Commons Attribution Non Commercial Share Alike 3.0 IGO',
    licenseId: 'CC-BY-NC-SA-3.0-IGO',
  },
  {
    name: 'Creative Commons Attribution Non Commercial Share Alike 4.0 International',
    licenseId: 'CC-BY-NC-SA-4.0',
  },
  {
    name: 'Creative Commons Attribution No Derivatives 1.0 Generic',
    licenseId: 'CC-BY-ND-1.0',
  },
  {
    name: 'Creative Commons Attribution No Derivatives 2.0 Generic',
    licenseId: 'CC-BY-ND-2.0',
  },
  {
    name: 'Creative Commons Attribution No Derivatives 2.5 Generic',
    licenseId: 'CC-BY-ND-2.5',
  },
  {
    name: 'Creative Commons Attribution No Derivatives 3.0 Unported',
    licenseId: 'CC-BY-ND-3.0',
  },
  {
    name: 'Creative Commons Attribution No Derivatives 3.0 Germany',
    licenseId: 'CC-BY-ND-3.0-DE',
  },
  {
    name: 'Creative Commons Attribution No Derivatives 4.0 International',
    licenseId: 'CC-BY-ND-4.0',
  },
  {
    name: 'Creative Commons Attribution Share Alike 1.0 Generic',
    licenseId: 'CC-BY-SA-1.0',
  },
  {
    name: 'Creative Commons Attribution Share Alike 2.0 Generic',
    licenseId: 'CC-BY-SA-2.0',
  },
  {
    name: 'Creative Commons Attribution Share Alike 2.0 England and Wales',
    licenseId: 'CC-BY-SA-2.0-UK',
  },
  {
    name: 'Creative Commons Attribution Share Alike 2.1 Japan',
    licenseId: 'CC-BY-SA-2.1-JP',
  },
  {
    name: 'Creative Commons Attribution Share Alike 2.5 Generic',
    licenseId: 'CC-BY-SA-2.5',
  },
  {
    name: 'Creative Commons Attribution Share Alike 3.0 Unported',
    licenseId: 'CC-BY-SA-3.0',
  },
  {
    name: 'Creative Commons Attribution Share Alike 3.0 Austria',
    licenseId: 'CC-BY-SA-3.0-AT',
  },
  {
    name: 'Creative Commons Attribution Share Alike 3.0 Germany',
    licenseId: 'CC-BY-SA-3.0-DE',
  },
  {
    name: 'Creative Commons Attribution-ShareAlike 3.0 IGO',
    licenseId: 'CC-BY-SA-3.0-IGO',
  },
  {
    name: 'Creative Commons Attribution Share Alike 4.0 International',
    licenseId: 'CC-BY-SA-4.0',
    isFsfLibre: true,
  },
  {
    name: 'Creative Commons Public Domain Dedication and Certification',
    licenseId: 'CC-PDDC',
  },
  {
    name: 'Creative Commons Zero v1.0 Universal',
    licenseId: 'CC0-1.0',
    isFsfLibre: true,
  },
  {
    name: 'Common Development and Distribution License 1.0',
    licenseId: 'CDDL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Common Development and Distribution License 1.1',
    licenseId: 'CDDL-1.1',
  },
  {
    name: 'Common Documentation License 1.0',
    licenseId: 'CDL-1.0',
  },
  {
    name: 'Community Data License Agreement Permissive 1.0',
    licenseId: 'CDLA-Permissive-1.0',
  },
  {
    name: 'Community Data License Agreement Permissive 2.0',
    licenseId: 'CDLA-Permissive-2.0',
  },
  {
    name: 'Community Data License Agreement Sharing 1.0',
    licenseId: 'CDLA-Sharing-1.0',
  },
  {
    name: 'CeCILL Free Software License Agreement v1.0',
    licenseId: 'CECILL-1.0',
  },
  {
    name: 'CeCILL Free Software License Agreement v1.1',
    licenseId: 'CECILL-1.1',
  },
  {
    name: 'CeCILL Free Software License Agreement v2.0',
    licenseId: 'CECILL-2.0',
    isFsfLibre: true,
  },
  {
    name: 'CeCILL Free Software License Agreement v2.1',
    licenseId: 'CECILL-2.1',
    isOsiApproved: true,
  },
  {
    name: 'CeCILL-B Free Software License Agreement',
    licenseId: 'CECILL-B',
    isFsfLibre: true,
  },
  {
    name: 'CeCILL-C Free Software License Agreement',
    licenseId: 'CECILL-C',
    isFsfLibre: true,
  },
  {
    name: 'CERN Open Hardware Licence v1.1',
    licenseId: 'CERN-OHL-1.1',
  },
  {
    name: 'CERN Open Hardware Licence v1.2',
    licenseId: 'CERN-OHL-1.2',
  },
  {
    name: 'CERN Open Hardware Licence Version 2 - Permissive',
    licenseId: 'CERN-OHL-P-2.0',
    isOsiApproved: true,
  },
  {
    name: 'CERN Open Hardware Licence Version 2 - Strongly Reciprocal',
    licenseId: 'CERN-OHL-S-2.0',
    isOsiApproved: true,
  },
  {
    name: 'CERN Open Hardware Licence Version 2 - Weakly Reciprocal',
    licenseId: 'CERN-OHL-W-2.0',
    isOsiApproved: true,
  },
  {
    name: 'CFITSIO License',
    licenseId: 'CFITSIO',
  },
  {
    name: 'check-cvs License',
    licenseId: 'check-cvs',
  },
  {
    name: 'Checkmk License',
    licenseId: 'checkmk',
  },
  {
    name: 'Clarified Artistic License',
    licenseId: 'ClArtistic',
    isFsfLibre: true,
  },
  {
    name: 'Clips License',
    licenseId: 'Clips',
  },
  {
    name: 'CMU Mach License',
    licenseId: 'CMU-Mach',
  },
  {
    name: 'CNRI Jython License',
    licenseId: 'CNRI-Jython',
  },
  {
    name: 'CNRI Python License',
    licenseId: 'CNRI-Python',
    isOsiApproved: true,
  },
  {
    name: 'CNRI Python Open Source GPL Compatible License Agreement',
    licenseId: 'CNRI-Python-GPL-Compatible',
  },
  {
    name: 'Copyfree Open Innovation License',
    licenseId: 'COIL-1.0',
  },
  {
    name: 'Community Specification License 1.0',
    licenseId: 'Community-Spec-1.0',
  },
  {
    name: 'Condor Public License v1.1',
    licenseId: 'Condor-1.1',
    isFsfLibre: true,
  },
  {
    name: 'copyleft-next 0.3.0',
    licenseId: 'copyleft-next-0.3.0',
  },
  {
    name: 'copyleft-next 0.3.1',
    licenseId: 'copyleft-next-0.3.1',
  },
  {
    name: 'Cornell Lossless JPEG License',
    licenseId: 'Cornell-Lossless-JPEG',
  },
  {
    name: 'Common Public Attribution License 1.0',
    licenseId: 'CPAL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Common Public License 1.0',
    licenseId: 'CPL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Code Project Open License 1.02',
    licenseId: 'CPOL-1.02',
  },
  {
    name: 'Cronyx License',
    licenseId: 'Cronyx',
  },
  {
    name: 'Crossword License',
    licenseId: 'Crossword',
  },
  {
    name: 'CrystalStacker License',
    licenseId: 'CrystalStacker',
  },
  {
    name: 'CUA Office Public License v1.0',
    licenseId: 'CUA-OPL-1.0',
    isOsiApproved: true,
  },
  {
    name: 'Cube License',
    licenseId: 'Cube',
  },
  {
    name: 'curl License',
    licenseId: 'curl',
  },
  {
    name: 'Deutsche Freie Software Lizenz',
    licenseId: 'D-FSL-1.0',
  },
  {
    name: 'DEC 3-Clause License',
    licenseId: 'DEC-3-Clause',
  },
  {
    name: 'diffmark license',
    licenseId: 'diffmark',
  },
  {
    name: 'Data licence Germany √ê attribution √ê version 2.0',
    licenseId: 'DL-DE-BY-2.0',
  },
  {
    name: 'Data licence Germany √ê zero √ê version 2.0',
    licenseId: 'DL-DE-ZERO-2.0',
  },
  {
    name: 'DOC License',
    licenseId: 'DOC',
  },
  {
    name: 'Dotseqn License',
    licenseId: 'Dotseqn',
  },
  {
    name: 'Detection Rule License 1.0',
    licenseId: 'DRL-1.0',
  },
  {
    name: 'Detection Rule License 1.1',
    licenseId: 'DRL-1.1',
  },
  {
    name: 'DSDP License',
    licenseId: 'DSDP',
  },
  {
    name: 'David M. Gay dtoa License',
    licenseId: 'dtoa',
  },
  {
    name: 'dvipdfm License',
    licenseId: 'dvipdfm',
  },
  {
    name: 'Educational Community License v1.0',
    licenseId: 'ECL-1.0',
    isOsiApproved: true,
  },
  {
    name: 'Educational Community License v2.0',
    licenseId: 'ECL-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'eCos license version 2.0',
    licenseId: 'eCos-2.0',
    isFsfLibre: true,
  },
  {
    name: 'Eiffel Forum License v1.0',
    licenseId: 'EFL-1.0',
    isOsiApproved: true,
  },
  {
    name: 'Eiffel Forum License v2.0',
    licenseId: 'EFL-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'eGenix.com Public License 1.1.0',
    licenseId: 'eGenix',
  },
  {
    name: 'Elastic License 2.0',
    licenseId: 'Elastic-2.0',
  },
  {
    name: 'Entessa Public License v1.0',
    licenseId: 'Entessa',
    isOsiApproved: true,
  },
  {
    name: 'EPICS Open License',
    licenseId: 'EPICS',
  },
  {
    name: 'Eclipse Public License 1.0',
    licenseId: 'EPL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Eclipse Public License 2.0',
    licenseId: 'EPL-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Erlang Public License v1.1',
    licenseId: 'ErlPL-1.1',
  },
  {
    name: 'Etalab Open License 2.0',
    licenseId: 'etalab-2.0',
  },
  {
    name: 'EU DataGrid Software License',
    licenseId: 'EUDatagrid',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'European Union Public License 1.0',
    licenseId: 'EUPL-1.0',
  },
  {
    name: 'European Union Public License 1.1',
    licenseId: 'EUPL-1.1',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'European Union Public License 1.2',
    licenseId: 'EUPL-1.2',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Eurosym License',
    licenseId: 'Eurosym',
  },
  {
    name: 'Fair License',
    licenseId: 'Fair',
    isOsiApproved: true,
  },
  {
    name: 'Fuzzy Bitmap License',
    licenseId: 'FBM',
  },
  {
    name: 'Fraunhofer FDK AAC Codec Library',
    licenseId: 'FDK-AAC',
  },
  {
    name: 'Ferguson Twofish License',
    licenseId: 'Ferguson-Twofish',
  },
  {
    name: 'Frameworx Open License 1.0',
    licenseId: 'Frameworx-1.0',
    isOsiApproved: true,
  },
  {
    name: 'FreeBSD Documentation License',
    licenseId: 'FreeBSD-DOC',
  },
  {
    name: 'FreeImage Public License v1.0',
    licenseId: 'FreeImage',
  },
  {
    name: 'FSF All Permissive License',
    licenseId: 'FSFAP',
    isFsfLibre: true,
  },
  {
    name: 'FSF Unlimited License',
    licenseId: 'FSFUL',
  },
  {
    name: 'FSF Unlimited License (with License Retention)',
    licenseId: 'FSFULLR',
  },
  {
    name: 'FSF Unlimited License (With License Retention and Warranty Disclaimer)',
    licenseId: 'FSFULLRWD',
  },
  {
    name: 'Freetype Project License',
    licenseId: 'FTL',
    isFsfLibre: true,
  },
  {
    name: 'Furuseth License',
    licenseId: 'Furuseth',
  },
  {
    name: 'fwlw License',
    licenseId: 'fwlw',
  },
  {
    name: 'Gnome GCR Documentation License',
    licenseId: 'GCR-docs',
  },
  {
    name: 'GD License',
    licenseId: 'GD',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU Free Documentation License v1.1',
    licenseId: 'GFDL-1.1',
    isFsfLibre: true,
  },
  {
    name: 'GNU Free Documentation License v1.1 only - invariants',
    licenseId: 'GFDL-1.1-invariants-only',
  },
  {
    name: 'GNU Free Documentation License v1.1 or later - invariants',
    licenseId: 'GFDL-1.1-invariants-or-later',
  },
  {
    name: 'GNU Free Documentation License v1.1 only - no invariants',
    licenseId: 'GFDL-1.1-no-invariants-only',
  },
  {
    name: 'GNU Free Documentation License v1.1 or later - no invariants',
    licenseId: 'GFDL-1.1-no-invariants-or-later',
  },
  {
    name: 'GNU Free Documentation License v1.1 only',
    licenseId: 'GFDL-1.1-only',
    isFsfLibre: true,
  },
  {
    name: 'GNU Free Documentation License v1.1 or later',
    licenseId: 'GFDL-1.1-or-later',
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU Free Documentation License v1.2',
    licenseId: 'GFDL-1.2',
    isFsfLibre: true,
  },
  {
    name: 'GNU Free Documentation License v1.2 only - invariants',
    licenseId: 'GFDL-1.2-invariants-only',
  },
  {
    name: 'GNU Free Documentation License v1.2 or later - invariants',
    licenseId: 'GFDL-1.2-invariants-or-later',
  },
  {
    name: 'GNU Free Documentation License v1.2 only - no invariants',
    licenseId: 'GFDL-1.2-no-invariants-only',
  },
  {
    name: 'GNU Free Documentation License v1.2 or later - no invariants',
    licenseId: 'GFDL-1.2-no-invariants-or-later',
  },
  {
    name: 'GNU Free Documentation License v1.2 only',
    licenseId: 'GFDL-1.2-only',
    isFsfLibre: true,
  },
  {
    name: 'GNU Free Documentation License v1.2 or later',
    licenseId: 'GFDL-1.2-or-later',
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU Free Documentation License v1.3',
    licenseId: 'GFDL-1.3',
    isFsfLibre: true,
  },
  {
    name: 'GNU Free Documentation License v1.3 only - invariants',
    licenseId: 'GFDL-1.3-invariants-only',
  },
  {
    name: 'GNU Free Documentation License v1.3 or later - invariants',
    licenseId: 'GFDL-1.3-invariants-or-later',
  },
  {
    name: 'GNU Free Documentation License v1.3 only - no invariants',
    licenseId: 'GFDL-1.3-no-invariants-only',
  },
  {
    name: 'GNU Free Documentation License v1.3 or later - no invariants',
    licenseId: 'GFDL-1.3-no-invariants-or-later',
  },
  {
    name: 'GNU Free Documentation License v1.3 only',
    licenseId: 'GFDL-1.3-only',
    isFsfLibre: true,
  },
  {
    name: 'GNU Free Documentation License v1.3 or later',
    licenseId: 'GFDL-1.3-or-later',
    isFsfLibre: true,
  },
  {
    name: 'Giftware License',
    licenseId: 'Giftware',
  },
  {
    name: 'GL2PS License',
    licenseId: 'GL2PS',
  },
  {
    name: '3dfx Glide License',
    licenseId: 'Glide',
  },
  {
    name: 'Glulxe License',
    licenseId: 'Glulxe',
  },
  {
    name: 'Good Luck With That Public License',
    licenseId: 'GLWTPL',
  },
  {
    name: 'gnuplot License',
    licenseId: 'gnuplot',
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v1.0 only',
    licenseId: 'GPL-1.0',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v1.0 or later',
    licenseId: 'GPL-1.0+',
  },
  {
    name: 'GNU General Public License v1.0 only',
    licenseId: 'GPL-1.0-only',
  },
  {
    name: 'GNU General Public License v1.0 or later',
    licenseId: 'GPL-1.0-or-later',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v2.0 only',
    licenseId: 'GPL-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v2.0 or later',
    licenseId: 'GPL-2.0+',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'GNU General Public License v2.0 only',
    licenseId: 'GPL-2.0-only',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'GNU General Public License v2.0 or later',
    licenseId: 'GPL-2.0-or-later',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v2.0 w/Autoconf exception',
    licenseId: 'GPL-2.0-with-autoconf-exception',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v2.0 w/Bison exception',
    licenseId: 'GPL-2.0-with-bison-exception',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v2.0 w/Classpath exception',
    licenseId: 'GPL-2.0-with-classpath-exception',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v2.0 w/Font exception',
    licenseId: 'GPL-2.0-with-font-exception',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v2.0 w/GCC Runtime Library exception',
    licenseId: 'GPL-2.0-with-GCC-exception',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v3.0 only',
    licenseId: 'GPL-3.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v3.0 or later',
    licenseId: 'GPL-3.0+',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'GNU General Public License v3.0 only',
    licenseId: 'GPL-3.0-only',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'GNU General Public License v3.0 or later',
    licenseId: 'GPL-3.0-or-later',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v3.0 w/Autoconf exception',
    licenseId: 'GPL-3.0-with-autoconf-exception',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU General Public License v3.0 w/GCC Runtime Library exception',
    licenseId: 'GPL-3.0-with-GCC-exception',
    isOsiApproved: true,
  },
  {
    name: 'Graphics Gems License',
    licenseId: 'Graphics-Gems',
  },
  {
    name: 'gSOAP Public License v1.3b',
    licenseId: 'gSOAP-1.3b',
  },
  {
    name: 'Haskell Language Report License',
    licenseId: 'HaskellReport',
  },
  {
    name: 'hdparm License',
    licenseId: 'hdparm',
  },
  {
    name: 'Hippocratic License 2.1',
    licenseId: 'Hippocratic-2.1',
  },
  {
    name: 'Hewlett-Packard 1986 License',
    licenseId: 'HP-1986',
  },
  {
    name: 'Hewlett-Packard 1989 License',
    licenseId: 'HP-1989',
  },
  {
    name: 'Historical Permission Notice and Disclaimer',
    licenseId: 'HPND',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Historical Permission Notice and Disclaimer - DEC variant',
    licenseId: 'HPND-DEC',
  },
  {
    name: 'Historical Permission Notice and Disclaimer - documentation variant',
    licenseId: 'HPND-doc',
  },
  {
    name: 'Historical Permission Notice and Disclaimer - documentation sell variant',
    licenseId: 'HPND-doc-sell',
  },
  {
    name: 'HPND with US Government export control warning',
    licenseId: 'HPND-export-US',
  },
  {
    name: 'HPND with US Government export control warning and modification rqmt',
    licenseId: 'HPND-export-US-modify',
  },
  {
    name: 'Historical Permission Notice and Disclaimer - Markus Kuhn variant',
    licenseId: 'HPND-Markus-Kuhn',
  },
  {
    name: 'Historical Permission Notice and Disclaimer - Pbmplus variant',
    licenseId: 'HPND-Pbmplus',
  },
  {
    name: 'Historical Permission Notice and Disclaimer - sell xserver variant with MIT disclaimer',
    licenseId: 'HPND-sell-MIT-disclaimer-xserver',
  },
  {
    name: 'Historical Permission Notice and Disclaimer - sell regexpr variant',
    licenseId: 'HPND-sell-regexpr',
  },
  {
    name: 'Historical Permission Notice and Disclaimer - sell variant',
    licenseId: 'HPND-sell-variant',
  },
  {
    name: 'HPND sell variant with MIT disclaimer',
    licenseId: 'HPND-sell-variant-MIT-disclaimer',
  },
  {
    name: 'Historical Permission Notice and Disclaimer - University of California variant',
    licenseId: 'HPND-UC',
  },
  {
    name: 'HTML Tidy License',
    licenseId: 'HTMLTIDY',
  },
  {
    name: 'IBM PowerPC Initialization and Boot Software',
    licenseId: 'IBM-pibs',
  },
  {
    name: 'ICU License',
    licenseId: 'ICU',
    isOsiApproved: true,
  },
  {
    name: 'IEC    Code Components End-user licence agreement',
    licenseId: 'IEC-Code-Components-EULA',
  },
  {
    name: 'Independent JPEG Group License',
    licenseId: 'IJG',
    isFsfLibre: true,
  },
  {
    name: 'Independent JPEG Group License - short',
    licenseId: 'IJG-short',
  },
  {
    name: 'ImageMagick License',
    licenseId: 'ImageMagick',
  },
  {
    name: 'iMatix Standard Function Library Agreement',
    licenseId: 'iMatix',
    isFsfLibre: true,
  },
  {
    name: 'Imlib2 License',
    licenseId: 'Imlib2',
    isFsfLibre: true,
  },
  {
    name: 'Info-ZIP License',
    licenseId: 'Info-ZIP',
  },
  {
    name: 'Inner Net License v2.0',
    licenseId: 'Inner-Net-2.0',
  },
  {
    name: 'Intel Open Source License',
    licenseId: 'Intel',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Intel ACPI Software License Agreement',
    licenseId: 'Intel-ACPI',
  },
  {
    name: 'Interbase Public License v1.0',
    licenseId: 'Interbase-1.0',
  },
  {
    name: 'IPA Font License',
    licenseId: 'IPA',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'IBM Public License v1.0',
    licenseId: 'IPL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'ISC License',
    licenseId: 'ISC',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Jam License',
    licenseId: 'Jam',
    isOsiApproved: true,
  },
  {
    name: 'JasPer License',
    licenseId: 'JasPer-2.0',
  },
  {
    name: 'JPL Image Use Policy',
    licenseId: 'JPL-image',
  },
  {
    name: 'Japan Network Information Center License',
    licenseId: 'JPNIC',
  },
  {
    name: 'JSON License',
    licenseId: 'JSON',
  },
  {
    name: 'Kastrup License',
    licenseId: 'Kastrup',
  },
  {
    name: 'Kazlib License',
    licenseId: 'Kazlib',
  },
  {
    name: 'Knuth CTAN License',
    licenseId: 'Knuth-CTAN',
  },
  {
    name: 'Licence Art Libre 1.2',
    licenseId: 'LAL-1.2',
  },
  {
    name: 'Licence Art Libre 1.3',
    licenseId: 'LAL-1.3',
  },
  {
    name: 'Latex2e License',
    licenseId: 'Latex2e',
  },
  {
    name: 'Latex2e with translated notice permission',
    licenseId: 'Latex2e-translated-notice',
  },
  {
    name: 'Leptonica License',
    licenseId: 'Leptonica',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU Library General Public License v2 only',
    licenseId: 'LGPL-2.0',
    isOsiApproved: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU Library General Public License v2 or later',
    licenseId: 'LGPL-2.0+',
    isOsiApproved: true,
  },
  {
    name: 'GNU Library General Public License v2 only',
    licenseId: 'LGPL-2.0-only',
    isOsiApproved: true,
  },
  {
    name: 'GNU Library General Public License v2 or later',
    licenseId: 'LGPL-2.0-or-later',
    isOsiApproved: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU Lesser General Public License v2.1 only',
    licenseId: 'LGPL-2.1',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU Lesser General Public License v2.1 or later',
    licenseId: 'LGPL-2.1+',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'GNU Lesser General Public License v2.1 only',
    licenseId: 'LGPL-2.1-only',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'GNU Lesser General Public License v2.1 or later',
    licenseId: 'LGPL-2.1-or-later',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU Lesser General Public License v3.0 only',
    licenseId: 'LGPL-3.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'GNU Lesser General Public License v3.0 or later',
    licenseId: 'LGPL-3.0+',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'GNU Lesser General Public License v3.0 only',
    licenseId: 'LGPL-3.0-only',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'GNU Lesser General Public License v3.0 or later',
    licenseId: 'LGPL-3.0-or-later',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Lesser General Public License For Linguistic Resources',
    licenseId: 'LGPLLR',
  },
  {
    name: 'libpng License',
    licenseId: 'Libpng',
  },
  {
    name: 'PNG Reference Library version 2',
    licenseId: 'libpng-2.0',
  },
  {
    name: 'libselinux public domain notice',
    licenseId: 'libselinux-1.0',
  },
  {
    name: 'libtiff License',
    licenseId: 'libtiff',
  },
  {
    name: 'libutil David Nugent License',
    licenseId: 'libutil-David-Nugent',
  },
  {
    name: 'Licence Libre du Qu¬ébec √ê Permissive version 1.1',
    licenseId: 'LiLiQ-P-1.1',
    isOsiApproved: true,
  },
  {
    name: 'Licence Libre du Qu¬ébec √ê R¬éciprocit¬é version 1.1',
    licenseId: 'LiLiQ-R-1.1',
    isOsiApproved: true,
  },
  {
    name: 'Licence Libre du Qu¬ébec √ê R¬éciprocit¬é forte version 1.1',
    licenseId: 'LiLiQ-Rplus-1.1',
    isOsiApproved: true,
  },
  {
    name: 'Linux man-pages - 1 paragraph',
    licenseId: 'Linux-man-pages-1-para',
  },
  {
    name: 'Linux man-pages Copyleft',
    licenseId: 'Linux-man-pages-copyleft',
  },
  {
    name: 'Linux man-pages Copyleft - 2 paragraphs',
    licenseId: 'Linux-man-pages-copyleft-2-para',
  },
  {
    name: 'Linux man-pages Copyleft Variant',
    licenseId: 'Linux-man-pages-copyleft-var',
  },
  {
    name: 'Linux Kernel Variant of OpenIB.org license',
    licenseId: 'Linux-OpenIB',
  },
  {
    name: 'Common Lisp LOOP License',
    licenseId: 'LOOP',
  },
  {
    name: 'Lucent Public License Version 1.0',
    licenseId: 'LPL-1.0',
    isOsiApproved: true,
  },
  {
    name: 'Lucent Public License v1.02',
    licenseId: 'LPL-1.02',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'LaTeX Project Public License v1.0',
    licenseId: 'LPPL-1.0',
  },
  {
    name: 'LaTeX Project Public License v1.1',
    licenseId: 'LPPL-1.1',
  },
  {
    name: 'LaTeX Project Public License v1.2',
    licenseId: 'LPPL-1.2',
    isFsfLibre: true,
  },
  {
    name: 'LaTeX Project Public License v1.3a',
    licenseId: 'LPPL-1.3a',
    isFsfLibre: true,
  },
  {
    name: 'LaTeX Project Public License v1.3c',
    licenseId: 'LPPL-1.3c',
    isOsiApproved: true,
  },
  {
    name: 'lsof License',
    licenseId: 'lsof',
  },
  {
    name: 'Lucida Bitmap Fonts License',
    licenseId: 'Lucida-Bitmap-Fonts',
  },
  {
    name: 'LZMA SDK License (versions 9.11 to 9.20)',
    licenseId: 'LZMA-SDK-9.11-to-9.20',
  },
  {
    name: 'LZMA SDK License (versions 9.22 and beyond)',
    licenseId: 'LZMA-SDK-9.22',
  },
  {
    name: 'magaz License',
    licenseId: 'magaz',
  },
  {
    name: 'MakeIndex License',
    licenseId: 'MakeIndex',
  },
  {
    name: 'Martin Birgmeier License',
    licenseId: 'Martin-Birgmeier',
  },
  {
    name: 'McPhee Slideshow License',
    licenseId: 'McPhee-slideshow',
  },
  {
    name: 'metamail License',
    licenseId: 'metamail',
  },
  {
    name: 'Minpack License',
    licenseId: 'Minpack',
  },
  {
    name: 'The MirOS Licence',
    licenseId: 'MirOS',
    isOsiApproved: true,
  },
  {
    name: 'MIT License',
    licenseId: 'MIT',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'MIT No Attribution',
    licenseId: 'MIT-0',
    isOsiApproved: true,
  },
  {
    name: 'Enlightenment License (e16)',
    licenseId: 'MIT-advertising',
  },
  {
    name: 'CMU License',
    licenseId: 'MIT-CMU',
  },
  {
    name: 'enna License',
    licenseId: 'MIT-enna',
  },
  {
    name: 'feh License',
    licenseId: 'MIT-feh',
  },
  {
    name: 'MIT Festival Variant',
    licenseId: 'MIT-Festival',
  },
  {
    name: 'MIT License Modern Variant',
    licenseId: 'MIT-Modern-Variant',
    isOsiApproved: true,
  },
  {
    name: 'MIT Open Group variant',
    licenseId: 'MIT-open-group',
  },
  {
    name: 'MIT testregex Variant',
    licenseId: 'MIT-testregex',
  },
  {
    name: 'MIT Tom Wu Variant',
    licenseId: 'MIT-Wu',
  },
  {
    name: 'MIT +no-false-attribs license',
    licenseId: 'MITNFA',
  },
  {
    name: 'MMIXware License',
    licenseId: 'MMIXware',
  },
  {
    name: 'Motosoto License',
    licenseId: 'Motosoto',
    isOsiApproved: true,
  },
  {
    name: 'MPEG Software Simulation',
    licenseId: 'MPEG-SSG',
  },
  {
    name: 'mpi Permissive License',
    licenseId: 'mpi-permissive',
  },
  {
    name: 'mpich2 License',
    licenseId: 'mpich2',
  },
  {
    name: 'Mozilla Public License 1.0',
    licenseId: 'MPL-1.0',
    isOsiApproved: true,
  },
  {
    name: 'Mozilla Public License 1.1',
    licenseId: 'MPL-1.1',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Mozilla Public License 2.0',
    licenseId: 'MPL-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Mozilla Public License 2.0 (no copyleft exception)',
    licenseId: 'MPL-2.0-no-copyleft-exception',
    isOsiApproved: true,
  },
  {
    name: 'mplus Font License',
    licenseId: 'mplus',
  },
  {
    name: 'Microsoft Limited Public License',
    licenseId: 'MS-LPL',
  },
  {
    name: 'Microsoft Public License',
    licenseId: 'MS-PL',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Microsoft Reciprocal License',
    licenseId: 'MS-RL',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Matrix Template Library License',
    licenseId: 'MTLL',
  },
  {
    name: 'Mulan Permissive Software License, Version 1',
    licenseId: 'MulanPSL-1.0',
  },
  {
    name: 'Mulan Permissive Software License, Version 2',
    licenseId: 'MulanPSL-2.0',
    isOsiApproved: true,
  },
  {
    name: 'Multics License',
    licenseId: 'Multics',
    isOsiApproved: true,
  },
  {
    name: 'Mup License',
    licenseId: 'Mup',
  },
  {
    name: 'Nara Institute of Science and Technology License (2003)',
    licenseId: 'NAIST-2003',
  },
  {
    name: 'NASA Open Source Agreement 1.3',
    licenseId: 'NASA-1.3',
    isOsiApproved: true,
  },
  {
    name: 'Naumen Public License',
    licenseId: 'Naumen',
    isOsiApproved: true,
  },
  {
    name: 'Net Boolean Public License v1',
    licenseId: 'NBPL-1.0',
  },
  {
    name: 'Non-Commercial Government Licence',
    licenseId: 'NCGL-UK-2.0',
  },
  {
    name: 'University of Illinois/NCSA Open Source License',
    licenseId: 'NCSA',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Net-SNMP License',
    licenseId: 'Net-SNMP',
  },
  {
    name: 'NetCDF license',
    licenseId: 'NetCDF',
  },
  {
    name: 'Newsletr License',
    licenseId: 'Newsletr',
  },
  {
    name: 'Nethack General Public License',
    licenseId: 'NGPL',
    isOsiApproved: true,
  },
  {
    name: 'NICTA Public Software License, Version 1.0',
    licenseId: 'NICTA-1.0',
  },
  {
    name: 'NIST Public Domain Notice',
    licenseId: 'NIST-PD',
  },
  {
    name: 'NIST Public Domain Notice with license fallback',
    licenseId: 'NIST-PD-fallback',
  },
  {
    name: 'NIST Software License',
    licenseId: 'NIST-Software',
  },
  {
    name: 'Norwegian Licence for Open Government Data (NLOD) 1.0',
    licenseId: 'NLOD-1.0',
  },
  {
    name: 'Norwegian Licence for Open Government Data (NLOD) 2.0',
    licenseId: 'NLOD-2.0',
  },
  {
    name: 'No Limit Public License',
    licenseId: 'NLPL',
  },
  {
    name: 'Nokia Open Source License',
    licenseId: 'Nokia',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Netizen Open Source License',
    licenseId: 'NOSL',
    isFsfLibre: true,
  },
  {
    name: 'Noweb License',
    licenseId: 'Noweb',
  },
  {
    name: 'Netscape Public License v1.0',
    licenseId: 'NPL-1.0',
    isFsfLibre: true,
  },
  {
    name: 'Netscape Public License v1.1',
    licenseId: 'NPL-1.1',
    isFsfLibre: true,
  },
  {
    name: 'Non-Profit Open Software License 3.0',
    licenseId: 'NPOSL-3.0',
    isOsiApproved: true,
  },
  {
    name: 'NRL License',
    licenseId: 'NRL',
  },
  {
    name: 'NTP License',
    licenseId: 'NTP',
    isOsiApproved: true,
  },
  {
    name: 'NTP No Attribution',
    licenseId: 'NTP-0',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'Nunit License',
    licenseId: 'Nunit',
    isFsfLibre: true,
  },
  {
    name: 'Open Use of Data Agreement v1.0',
    licenseId: 'O-UDA-1.0',
  },
  {
    name: 'Open CASCADE Technology Public License',
    licenseId: 'OCCT-PL',
  },
  {
    name: 'OCLC Research Public License 2.0',
    licenseId: 'OCLC-2.0',
    isOsiApproved: true,
  },
  {
    name: 'Open Data Commons Open Database License v1.0',
    licenseId: 'ODbL-1.0',
    isFsfLibre: true,
  },
  {
    name: 'Open Data Commons Attribution License v1.0',
    licenseId: 'ODC-By-1.0',
  },
  {
    name: 'OFFIS License',
    licenseId: 'OFFIS',
  },
  {
    name: 'SIL Open Font License 1.0',
    licenseId: 'OFL-1.0',
    isFsfLibre: true,
  },
  {
    name: 'SIL Open Font License 1.0 with no Reserved Font Name',
    licenseId: 'OFL-1.0-no-RFN',
  },
  {
    name: 'SIL Open Font License 1.0 with Reserved Font Name',
    licenseId: 'OFL-1.0-RFN',
  },
  {
    name: 'SIL Open Font License 1.1',
    licenseId: 'OFL-1.1',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'SIL Open Font License 1.1 with no Reserved Font Name',
    licenseId: 'OFL-1.1-no-RFN',
    isOsiApproved: true,
  },
  {
    name: 'SIL Open Font License 1.1 with Reserved Font Name',
    licenseId: 'OFL-1.1-RFN',
    isOsiApproved: true,
  },
  {
    name: 'OGC Software License, Version 1.0',
    licenseId: 'OGC-1.0',
  },
  {
    name: 'Taiwan Open Government Data License, version 1.0',
    licenseId: 'OGDL-Taiwan-1.0',
  },
  {
    name: 'Open Government Licence - Canada',
    licenseId: 'OGL-Canada-2.0',
  },
  {
    name: 'Open Government Licence v1.0',
    licenseId: 'OGL-UK-1.0',
  },
  {
    name: 'Open Government Licence v2.0',
    licenseId: 'OGL-UK-2.0',
  },
  {
    name: 'Open Government Licence v3.0',
    licenseId: 'OGL-UK-3.0',
  },
  {
    name: 'Open Group Test Suite License',
    licenseId: 'OGTSL',
    isOsiApproved: true,
  },
  {
    name: 'Open LDAP Public License v1.1',
    licenseId: 'OLDAP-1.1',
  },
  {
    name: 'Open LDAP Public License v1.2',
    licenseId: 'OLDAP-1.2',
  },
  {
    name: 'Open LDAP Public License v1.3',
    licenseId: 'OLDAP-1.3',
  },
  {
    name: 'Open LDAP Public License v1.4',
    licenseId: 'OLDAP-1.4',
  },
  {
    name: 'Open LDAP Public License v2.0 (or possibly 2.0A and 2.0B)',
    licenseId: 'OLDAP-2.0',
  },
  {
    name: 'Open LDAP Public License v2.0.1',
    licenseId: 'OLDAP-2.0.1',
  },
  {
    name: 'Open LDAP Public License v2.1',
    licenseId: 'OLDAP-2.1',
  },
  {
    name: 'Open LDAP Public License v2.2',
    licenseId: 'OLDAP-2.2',
  },
  {
    name: 'Open LDAP Public License v2.2.1',
    licenseId: 'OLDAP-2.2.1',
  },
  {
    name: 'Open LDAP Public License 2.2.2',
    licenseId: 'OLDAP-2.2.2',
  },
  {
    name: 'Open LDAP Public License v2.3',
    licenseId: 'OLDAP-2.3',
    isFsfLibre: true,
  },
  {
    name: 'Open LDAP Public License v2.4',
    licenseId: 'OLDAP-2.4',
  },
  {
    name: 'Open LDAP Public License v2.5',
    licenseId: 'OLDAP-2.5',
  },
  {
    name: 'Open LDAP Public License v2.6',
    licenseId: 'OLDAP-2.6',
  },
  {
    name: 'Open LDAP Public License v2.7',
    licenseId: 'OLDAP-2.7',
    isFsfLibre: true,
  },
  {
    name: 'Open LDAP Public License v2.8',
    licenseId: 'OLDAP-2.8',
    isOsiApproved: true,
  },
  {
    name: 'Open Logistics Foundation License Version 1.3',
    licenseId: 'OLFL-1.3',
    isOsiApproved: true,
  },
  {
    name: 'Open Market License',
    licenseId: 'OML',
  },
  {
    name: 'OpenPBS v2.3 Software License',
    licenseId: 'OpenPBS-2.3',
  },
  {
    name: 'OpenSSL License',
    licenseId: 'OpenSSL',
    isFsfLibre: true,
  },
  {
    name: 'Open Public License v1.0',
    licenseId: 'OPL-1.0',
  },
  {
    name: 'United    Kingdom Open Parliament Licence v3.0',
    licenseId: 'OPL-UK-3.0',
  },
  {
    name: 'Open Publication License v1.0',
    licenseId: 'OPUBL-1.0',
  },
  {
    name: 'OSET Public License version 2.1',
    licenseId: 'OSET-PL-2.1',
    isOsiApproved: true,
  },
  {
    name: 'Open Software License 1.0',
    licenseId: 'OSL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Open Software License 1.1',
    licenseId: 'OSL-1.1',
    isFsfLibre: true,
  },
  {
    name: 'Open Software License 2.0',
    licenseId: 'OSL-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Open Software License 2.1',
    licenseId: 'OSL-2.1',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Open Software License 3.0',
    licenseId: 'OSL-3.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'PADL License',
    licenseId: 'PADL',
  },
  {
    name: 'The Parity Public License 6.0.0',
    licenseId: 'Parity-6.0.0',
  },
  {
    name: 'The Parity Public License 7.0.0',
    licenseId: 'Parity-7.0.0',
  },
  {
    name: 'Open Data Commons Public Domain Dedication & License 1.0',
    licenseId: 'PDDL-1.0',
  },
  {
    name: 'PHP License v3.0',
    licenseId: 'PHP-3.0',
    isOsiApproved: true,
  },
  {
    name: 'PHP License v3.01',
    licenseId: 'PHP-3.01',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Pixar License',
    licenseId: 'Pixar',
  },
  {
    name: 'Plexus Classworlds License',
    licenseId: 'Plexus',
  },
  {
    name: 'pnmstitch License',
    licenseId: 'pnmstitch',
  },
  {
    name: 'PolyForm Noncommercial License 1.0.0',
    licenseId: 'PolyForm-Noncommercial-1.0.0',
  },
  {
    name: 'PolyForm Small Business License 1.0.0',
    licenseId: 'PolyForm-Small-Business-1.0.0',
  },
  {
    name: 'PostgreSQL License',
    licenseId: 'PostgreSQL',
    isOsiApproved: true,
  },
  {
    name: 'Python Software Foundation License 2.0',
    licenseId: 'PSF-2.0',
  },
  {
    name: 'psfrag License',
    licenseId: 'psfrag',
  },
  {
    name: 'psutils License',
    licenseId: 'psutils',
  },
  {
    name: 'Python License 2.0',
    licenseId: 'Python-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Python License 2.0.1',
    licenseId: 'Python-2.0.1',
  },
  {
    name: 'Python ldap License',
    licenseId: 'python-ldap',
  },
  {
    name: 'Qhull License',
    licenseId: 'Qhull',
  },
  {
    name: 'Q Public License 1.0',
    licenseId: 'QPL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Q Public License 1.0 - INRIA 2004 variant',
    licenseId: 'QPL-1.0-INRIA-2004',
  },
  {
    name: 'Rdisc License',
    licenseId: 'Rdisc',
  },
  {
    name: 'Red Hat eCos Public License v1.1',
    licenseId: 'RHeCos-1.1',
  },
  {
    name: 'Reciprocal Public License 1.1',
    licenseId: 'RPL-1.1',
    isOsiApproved: true,
  },
  {
    name: 'Reciprocal Public License 1.5',
    licenseId: 'RPL-1.5',
    isOsiApproved: true,
  },
  {
    name: 'RealNetworks Public Source License v1.0',
    licenseId: 'RPSL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'RSA Message-Digest License',
    licenseId: 'RSA-MD',
  },
  {
    name: 'Ricoh Source Code Public License',
    licenseId: 'RSCPL',
    isOsiApproved: true,
  },
  {
    name: 'Ruby License',
    licenseId: 'Ruby',
    isFsfLibre: true,
  },
  {
    name: 'Sax Public Domain Notice',
    licenseId: 'SAX-PD',
  },
  {
    name: 'Saxpath License',
    licenseId: 'Saxpath',
  },
  {
    name: 'SCEA Shared Source License',
    licenseId: 'SCEA',
  },
  {
    name: 'Scheme Language Report License',
    licenseId: 'SchemeReport',
  },
  {
    name: 'Sendmail License',
    licenseId: 'Sendmail',
  },
  {
    name: 'Sendmail License 8.23',
    licenseId: 'Sendmail-8.23',
  },
  {
    name: 'SGI Free Software License B v1.0',
    licenseId: 'SGI-B-1.0',
  },
  {
    name: 'SGI Free Software License B v1.1',
    licenseId: 'SGI-B-1.1',
  },
  {
    name: 'SGI Free Software License B v2.0',
    licenseId: 'SGI-B-2.0',
    isFsfLibre: true,
  },
  {
    name: 'SGI OpenGL License',
    licenseId: 'SGI-OpenGL',
  },
  {
    name: 'SGP4 Permission Notice',
    licenseId: 'SGP4',
  },
  {
    name: 'Solderpad Hardware License v0.5',
    licenseId: 'SHL-0.5',
  },
  {
    name: 'Solderpad Hardware License, Version 0.51',
    licenseId: 'SHL-0.51',
  },
  {
    name: 'Simple Public License 2.0',
    licenseId: 'SimPL-2.0',
    isOsiApproved: true,
  },
  {
    name: 'Sun Industry Standards Source License v1.1',
    licenseId: 'SISSL',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Sun Industry Standards Source License v1.2',
    licenseId: 'SISSL-1.2',
  },
  {
    name: 'SL License',
    licenseId: 'SL',
  },
  {
    name: 'Sleepycat License',
    licenseId: 'Sleepycat',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Standard ML of New Jersey License',
    licenseId: 'SMLNJ',
    isFsfLibre: true,
  },
  {
    name: 'Secure Messaging Protocol Public License',
    licenseId: 'SMPPL',
  },
  {
    name: 'SNIA Public License 1.1',
    licenseId: 'SNIA',
  },
  {
    name: 'snprintf License',
    licenseId: 'snprintf',
  },
  {
    name: 'Soundex License',
    licenseId: 'Soundex',
  },
  {
    name: 'Spencer License 86',
    licenseId: 'Spencer-86',
  },
  {
    name: 'Spencer License 94',
    licenseId: 'Spencer-94',
  },
  {
    name: 'Spencer License 99',
    licenseId: 'Spencer-99',
  },
  {
    name: 'Sun Public License v1.0',
    licenseId: 'SPL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'ssh-keyscan License',
    licenseId: 'ssh-keyscan',
  },
  {
    name: 'SSH OpenSSH license',
    licenseId: 'SSH-OpenSSH',
  },
  {
    name: 'SSH short notice',
    licenseId: 'SSH-short',
  },
  {
    name: 'Server Side Public License, v 1',
    licenseId: 'SSPL-1.0',
  },
  {
    isDeprecatedLicenseId: true,
    name: 'Standard ML of New Jersey License',
    licenseId: 'StandardML-NJ',
    isFsfLibre: true,
  },
  {
    name: 'SugarCRM Public License v1.1.3',
    licenseId: 'SugarCRM-1.1.3',
  },
  {
    name: 'SunPro License',
    licenseId: 'SunPro',
  },
  {
    name: 'Scheme Widget Library (SWL) Software License Agreement',
    licenseId: 'SWL',
  },
  {
    name: 'swrule License',
    licenseId: 'swrule',
  },
  {
    name: 'Symlinks License',
    licenseId: 'Symlinks',
  },
  {
    name: 'TAPR Open Hardware License v1.0',
    licenseId: 'TAPR-OHL-1.0',
  },
  {
    name: 'TCL/TK License',
    licenseId: 'TCL',
  },
  {
    name: 'TCP Wrappers License',
    licenseId: 'TCP-wrappers',
  },
  {
    name: 'TermReadKey License',
    licenseId: 'TermReadKey',
  },
  {
    name: 'TMate Open Source License',
    licenseId: 'TMate',
  },
  {
    name: 'TORQUE v2.5+ Software License v1.1',
    licenseId: 'TORQUE-1.1',
  },
  {
    name: 'Trusster Open Source License',
    licenseId: 'TOSL',
  },
  {
    name: 'Time::ParseDate License',
    licenseId: 'TPDL',
  },
  {
    name: 'THOR Public License 1.0',
    licenseId: 'TPL-1.0',
  },
  {
    name: 'Text-Tabs+Wrap License',
    licenseId: 'TTWL',
  },
  {
    name: 'TTYP0 License',
    licenseId: 'TTYP0',
  },
  {
    name: 'Technische Universitaet Berlin License 1.0',
    licenseId: 'TU-Berlin-1.0',
  },
  {
    name: 'Technische Universitaet Berlin License 2.0',
    licenseId: 'TU-Berlin-2.0',
  },
  {
    name: 'UCAR License',
    licenseId: 'UCAR',
  },
  {
    name: 'Upstream Compatibility License v1.0',
    licenseId: 'UCL-1.0',
    isOsiApproved: true,
  },
  {
    name: 'ulem License',
    licenseId: 'ulem',
  },
  {
    name: 'Unicode License Agreement - Data Files and Software (2015)',
    licenseId: 'Unicode-DFS-2015',
  },
  {
    name: 'Unicode License Agreement - Data Files and Software (2016)',
    licenseId: 'Unicode-DFS-2016',
    isOsiApproved: true,
  },
  {
    name: 'Unicode Terms of Use',
    licenseId: 'Unicode-TOU',
  },
  {
    name: 'UnixCrypt License',
    licenseId: 'UnixCrypt',
  },
  {
    name: 'The Unlicense',
    licenseId: 'Unlicense',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Universal Permissive License v1.0',
    licenseId: 'UPL-1.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Utah Raster Toolkit Run Length Encoded License',
    licenseId: 'URT-RLE',
  },
  {
    name: 'Vim License',
    licenseId: 'Vim',
    isFsfLibre: true,
  },
  {
    name: 'VOSTROM Public License for Open Source',
    licenseId: 'VOSTROM',
  },
  {
    name: 'Vovida Software License v1.0',
    licenseId: 'VSL-1.0',
    isOsiApproved: true,
  },
  {
    name: 'W3C Software Notice and License (2002-12-31)',
    licenseId: 'W3C',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'W3C Software Notice and License (1998-07-20)',
    licenseId: 'W3C-19980720',
  },
  {
    name: 'W3C Software Notice and Document License (2015-05-13)',
    licenseId: 'W3C-20150513',
  },
  {
    name: 'w3m License',
    licenseId: 'w3m',
  },
  {
    name: 'Sybase Open Watcom Public License 1.0',
    licenseId: 'Watcom-1.0',
    isOsiApproved: true,
  },
  {
    name: 'Widget Workshop License',
    licenseId: 'Widget-Workshop',
  },
  {
    name: 'Wsuipa License',
    licenseId: 'Wsuipa',
  },
  {
    name: 'Do What The F*ck You Want To Public License',
    licenseId: 'WTFPL',
    isFsfLibre: true,
  },
  {
    isDeprecatedLicenseId: true,
    name: 'wxWindows Library License',
    licenseId: 'wxWindows',
    isOsiApproved: true,
  },
  {
    name: 'X11 License',
    licenseId: 'X11',
    isFsfLibre: true,
  },
  {
    name: 'X11 License Distribution Modification Variant',
    licenseId: 'X11-distribute-modifications-variant',
  },
  {
    name: 'Xdebug License v 1.03',
    licenseId: 'Xdebug-1.03',
  },
  {
    name: 'Xerox License',
    licenseId: 'Xerox',
  },
  {
    name: 'Xfig License',
    licenseId: 'Xfig',
  },
  {
    name: 'XFree86 License 1.1',
    licenseId: 'XFree86-1.1',
    isFsfLibre: true,
  },
  {
    name: 'xinetd License',
    licenseId: 'xinetd',
    isFsfLibre: true,
  },
  {
    name: 'xlock License',
    licenseId: 'xlock',
  },
  {
    name: 'X.Net License',
    licenseId: 'Xnet',
    isOsiApproved: true,
  },
  {
    name: 'XPP License',
    licenseId: 'xpp',
  },
  {
    name: 'XSkat License',
    licenseId: 'XSkat',
  },
  {
    name: 'Yahoo! Public License v1.0',
    licenseId: 'YPL-1.0',
  },
  {
    name: 'Yahoo! Public License v1.1',
    licenseId: 'YPL-1.1',
    isFsfLibre: true,
  },
  {
    name: 'Zed License',
    licenseId: 'Zed',
  },
  {
    name: 'Zeeff License',
    licenseId: 'Zeeff',
  },
  {
    name: 'Zend License v2.0',
    licenseId: 'Zend-2.0',
    isFsfLibre: true,
  },
  {
    name: 'Zimbra Public License v1.3',
    licenseId: 'Zimbra-1.3',
    isFsfLibre: true,
  },
  {
    name: 'Zimbra Public License v1.4',
    licenseId: 'Zimbra-1.4',
  },
  {
    name: 'zlib License',
    licenseId: 'Zlib',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'zlib/libpng License with Acknowledgement',
    licenseId: 'zlib-acknowledgement',
  },
  {
    name: 'Zope Public License 1.1',
    licenseId: 'ZPL-1.1',
  },
  {
    name: 'Zope Public License 2.0',
    licenseId: 'ZPL-2.0',
    isOsiApproved: true,
    isFsfLibre: true,
  },
  {
    name: 'Zope Public License 2.1',
    licenseId: 'ZPL-2.1',
    isOsiApproved: true,
    isFsfLibre: true,
  },
];
export default spdxLicenses;
