import React, { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  affineDecrypt,
  affineEncrypt,
  binaryModExpSteps,
  charToNum,
  extendedGcdSteps,
  factorSmallSemiprime,
  generateNumberTheoryProblem,
  numToChar,
  rsaDecryptBlock,
  rsaEncryptBlock,
  solveCRT,
  solveIsbn10Missing,
  solveLinearCongruence,
} from '../../math/numberTheory';
import { randomSeedCode } from '../../math/prng';
import { useApp } from '../../context/AppContext';
import { MathFormula } from '../Math';

export const NumberTheoryLab: React.FC = () => {
  const { recordPractice } = useApp();
  const [tab, setTab] = useState<'modexp' | 'extgcd' | 'crt' | 'crypto'>('modexp');

  // ModExp state (Preset = Assignment 2 Q2a: 7^644 mod 645)
  const [base, setBase] = useState(7);
  const [exp, setExp] = useState(644);
  const [modulus, setModulus] = useState(645);
  const [modAns, setModAns] = useState('');
  const [modBinAns, setModBinAns] = useState('');
  const [modChecked, setModChecked] = useState(false);

  // ExtGCD & Linear Congruence state (Preset = A2 Q3a & Q4a)
  const [gcdA, setGcdA] = useState(24140);
  const [gcdB, setGcdB] = useState(16762);
  const [userGcd, setUserGcd] = useState('');
  const [userS, setUserS] = useState('');
  const [userT, setUserT] = useState('');
  const [gcdChecked, setGcdChecked] = useState(false);

  const [linA, setLinA] = useState(144);
  const [linB, setLinB] = useState(4);
  const [linM, setLinM] = useState(233);
  const [userLinX, setUserLinX] = useState('');
  const [linChecked, setLinChecked] = useState(false);

  // CRT state (Preset = A2 Q4b)
  const [crtRows, setCrtRows] = useState([
    { a: 2, m: 3 },
    { a: 1, m: 4 },
    { a: 3, m: 5 },
  ]);
  const [userCrtX, setUserCrtX] = useState('');
  const [crtChecked, setCrtChecked] = useState(false);

  // Crypto state (ISBN, Affine, RSA)
  const [isbnPattern, setIsbnPattern] = useState('0-07-8?0008-0');
  const [userIsbn, setUserIsbn] = useState('');
  const [isbnChecked, setIsbnChecked] = useState(false);

  const [affineText, setAffineText] = useState('JFFG JF DG GAF KSHYTF');
  const [affineA, setAffineA] = useState(7);
  const [affineB, setAffineB] = useState(3);

  const [rsaN, setRsaN] = useState(119);
  const [rsaE, setRsaE] = useState(5);
  const [rsaWord, setRsaWord] = useState('GO');
  const [rsaCipherNums, setRsaCipherNums] = useState('96 72 86');

  const modRes = useMemo(() => {
    try {
      return binaryModExpSteps(base, exp, modulus);
    } catch {
      return null;
    }
  }, [base, exp, modulus]);

  const gcdRes = useMemo(() => extendedGcdSteps(gcdA, gcdB), [gcdA, gcdB]);
  const linRes = useMemo(() => solveLinearCongruence(linA, linB, linM), [linA, linB, linM]);

  const crtRes = useMemo(() => {
    try {
      return solveCRT(crtRows);
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Invalid CRT system' };
    }
  }, [crtRows]);

  const isbnRes = useMemo(() => {
    try {
      return solveIsbn10Missing(isbnPattern);
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Invalid ISBN-10' };
    }
  }, [isbnPattern]);

  const rsaRes = useMemo(() => {
    try {
      const fac = factorSmallSemiprime(rsaN);
      const d = solveLinearCongruence(rsaE, 1, fac.phi).solutions[0];
      const encrypted = rsaWord
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .split('')
        .map((ch) => ({
          ch,
          m: charToNum(ch),
          c: rsaEncryptBlock(charToNum(ch), rsaE, rsaN).result,
        }));
      const decrypted = rsaCipherNums
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((tok) => {
          const c = Number(tok);
          const m = rsaDecryptBlock(c, d, rsaN).result;
          return { c, m, ch: m >= 0 && m < 26 ? numToChar(m) : '?' };
        });
      return { fac, d, encrypted, decrypted, error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Invalid RSA parameters' };
    }
  }, [rsaN, rsaE, rsaWord, rsaCipherNums]);

  const randomizeAll = () => {
    const p = generateNumberTheoryProblem(randomSeedCode());
    setBase(p.modExp.base);
    setExp(p.modExp.exp);
    setModulus(p.modExp.modulus);
    setModAns('');
    setModBinAns('');
    setModChecked(false);

    setGcdA(p.extGcd.a);
    setGcdB(p.extGcd.b);
    setUserGcd('');
    setUserS('');
    setUserT('');
    setGcdChecked(false);

    setLinA(p.linear.a);
    setLinB(p.linear.b);
    setLinM(p.linear.m);
    setUserLinX('');
    setLinChecked(false);

    setCrtRows(p.crt);
    setUserCrtX('');
    setCrtChecked(false);

    setIsbnPattern(p.isbn.pattern);
    setUserIsbn('');
    setIsbnChecked(false);

    setRsaN(p.rsa.n);
    setRsaE(p.rsa.e);
    setRsaWord(p.rsa.msgWord);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'modexp', label: 'Binary ModExp' },
            { id: 'extgcd', label: 'Euclidean & Linear Cong.' },
            { id: 'crt', label: 'Chinese Remainder (CRT)' },
            { id: 'crypto', label: 'ISBN-10, Affine & RSA' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
                tab === t.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={randomizeAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> New Random Numbers
        </button>
      </div>

      {tab === 'modexp' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Base b</label>
              <input
                type="number"
                value={base}
                onChange={(e) => {
                  setBase(Number(e.target.value));
                  setModChecked(false);
                }}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Exponent n</label>
              <input
                type="number"
                min={0}
                value={exp}
                onChange={(e) => {
                  setExp(Number(e.target.value));
                  setModChecked(false);
                }}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Modulus m</label>
              <input
                type="number"
                min={2}
                value={modulus}
                onChange={(e) => {
                  setModulus(Number(e.target.value));
                  setModChecked(false);
                }}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center gap-4">
            <MathFormula tex={`${base}^{${exp}} \\bmod ${modulus}`} className="text-base font-bold" />
            <input
              value={modBinAns}
              onChange={(e) => setModBinAns(e.target.value)}
              placeholder="Binary of n (e.g. 1010000100)"
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs w-52"
            />
            <input
              value={modAns}
              onChange={(e) => setModAns(e.target.value)}
              placeholder="Final remainder"
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs w-36"
            />
            <button
              onClick={() => {
                setModChecked(true);
                if (modRes) {
                  const ok = Number(modAns.trim()) === modRes.result;
                  recordPractice('ch4', ok);
                }
              }}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
            >
              Verify &amp; Show Table
            </button>
          </div>

          {modChecked && modRes && (
            <div className="space-y-3">
              <div className="text-sm">
                Binary expansion: <code className="font-mono font-bold">({modRes.binaryMsb})₂</code> — Final answer:{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{modRes.result}</strong>
                {modBinAns.trim() && (
                  <span className="ml-2 text-xs">
                    (Your binary: {modBinAns.trim() === modRes.binaryMsb ? '✓ Match' : `✗ Expected ${modRes.binaryMsb}`})
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <th className="p-2 text-left">j</th>
                      <th className="p-2 text-left">bit a_j</th>
                      <th className="p-2 text-left">power = b^(2^j) mod m</th>
                      <th className="p-2 text-left">running product x</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modRes.steps.map((s) => (
                      <tr key={s.j} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="p-2">{s.j}</td>
                        <td className="p-2 font-bold">{s.bit}</td>
                        <td className="p-2">{s.powerVal}</td>
                        <td className={`p-2 ${s.bit === 1 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
                          {s.xAfter}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'extgcd' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm">Extended Euclidean Algorithm &amp; Bézout Coefficients</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs text-slate-500">a</label>
                <input
                  type="number"
                  value={gcdA}
                  onChange={(e) => {
                    setGcdA(Number(e.target.value));
                    setGcdChecked(false);
                  }}
                  className="block mt-1 w-28 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">b</label>
                <input
                  type="number"
                  value={gcdB}
                  onChange={(e) => {
                    setGcdB(Number(e.target.value));
                    setGcdChecked(false);
                  }}
                  className="block mt-1 w-28 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-sm"
                />
              </div>
              <input
                value={userGcd}
                onChange={(e) => setUserGcd(e.target.value)}
                placeholder="gcd(a,b)"
                className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs"
              />
              <input
                value={userS}
                onChange={(e) => setUserS(e.target.value)}
                placeholder="s"
                className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs"
              />
              <input
                value={userT}
                onChange={(e) => setUserT(e.target.value)}
                placeholder="t"
                className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs"
              />
              <button
                onClick={() => {
                  setGcdChecked(true);
                  const ok =
                    Number(userGcd) === gcdRes.gcd &&
                    Number(userS) * gcdA + Number(userT) * gcdB === gcdRes.gcd;
                  recordPractice('ch4', ok);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
              >
                Check &amp; Show Steps
              </button>
            </div>

            {gcdChecked && (
              <div className="grid md:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-sans font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Forward Divisions:
                  </div>
                  {gcdRes.divisions.map((d, idx) => (
                    <div key={idx}>
                      {d.dividend} = {d.quotient} · {d.divisor} + <strong>{d.remainder}</strong>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                  <div className="font-sans font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Bézout &amp; LCM:
                  </div>
                  <div>gcd = {gcdRes.gcd}, lcm = {gcdRes.lcm.toLocaleString()}</div>
                  <div>
                    ({gcdRes.s})·{gcdA} + ({gcdRes.t})·{gcdB} = {gcdRes.gcd}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm">Linear Congruence Solver: ax ≡ b (mod m)</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="number"
                value={linA}
                onChange={(e) => {
                  setLinA(Number(e.target.value));
                  setLinChecked(false);
                }}
                className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-sm"
              />
              <span className="font-mono text-sm">x ≡</span>
              <input
                type="number"
                value={linB}
                onChange={(e) => {
                  setLinB(Number(e.target.value));
                  setLinChecked(false);
                }}
                className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-sm"
              />
              <span className="font-mono text-sm">(mod</span>
              <input
                type="number"
                value={linM}
                onChange={(e) => {
                  setLinM(Number(e.target.value));
                  setLinChecked(false);
                }}
                className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-sm"
              />
              <span className="font-mono text-sm">)</span>
              <input
                value={userLinX}
                onChange={(e) => setUserLinX(e.target.value)}
                placeholder="Your x mod m"
                className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs"
              />
              <button
                onClick={() => {
                  setLinChecked(true);
                  const ok = linRes.solvable && linRes.solutions.includes(Number(userLinX.trim()));
                  recordPractice('ch4', ok);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
              >
                Solve &amp; Check
              </button>
            </div>
            {linChecked && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-mono">
                {linRes.solvable ? (
                  <span>
                    gcd={linRes.gcd}, reduced inverse={linRes.inverseModReduced} (mod {linRes.reducedMod}) → Solutions mod {linM}:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {linRes.solutions.join(', ')}
                    </strong>
                  </span>
                ) : (
                  <span className="text-rose-500">
                    No solution because gcd({linA}, {linM}) = {linRes.gcd} does not divide {linB}.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'crt' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="space-y-2">
            {crtRows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2 font-mono text-sm">
                <span>x ≡</span>
                <input
                  type="number"
                  value={row.a}
                  onChange={(e) => {
                    const next = [...crtRows];
                    next[idx] = { ...next[idx], a: Number(e.target.value) };
                    setCrtRows(next);
                    setCrtChecked(false);
                  }}
                  className="w-20 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700"
                />
                <span>(mod</span>
                <input
                  type="number"
                  min={2}
                  value={row.m}
                  onChange={(e) => {
                    const next = [...crtRows];
                    next[idx] = { ...next[idx], m: Number(e.target.value) };
                    setCrtRows(next);
                    setCrtChecked(false);
                  }}
                  className="w-20 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700"
                />
                <span>)</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <input
              value={userCrtX}
              onChange={(e) => setUserCrtX(e.target.value)}
              placeholder="Your x mod M"
              className="w-36 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs"
            />
            <button
              onClick={() => {
                setCrtChecked(true);
                if (!('error' in crtRes)) {
                  recordPractice('ch4', Number(userCrtX.trim()) === crtRes.x);
                }
              }}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
            >
              Check &amp; Derive CRT
            </button>
          </div>

          {crtChecked && ('error' in crtRes ? (
            <div className="text-xs text-rose-500">{crtRes.error}</div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-1.5">
              <div>M = {crtRes.M}</div>
              {crtRes.entries.map((e, i) => (
                <div key={i}>
                  k={i + 1}: a<sub>{i + 1}</sub>={e.a}, M<sub>{i + 1}</sub>={e.Mk}, y<sub>{i + 1}</sub>=M<sub>{i + 1}</sub>⁻¹ mod {e.m}={e.yk} → term = {e.term}
                </div>
              ))}
              <div className="pt-1 font-bold text-emerald-600 dark:text-emerald-400">
                x ≡ {crtRes.rawSum} ≡ {crtRes.x} (mod {crtRes.M})
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'crypto' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm">ISBN-10 Missing Digit Recovery</h3>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={isbnPattern}
                onChange={(e) => {
                  setIsbnPattern(e.target.value);
                  setIsbnChecked(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-sm w-44"
              />
              <input
                value={userIsbn}
                onChange={(e) => setUserIsbn(e.target.value)}
                placeholder="Missing digit"
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs w-28"
              />
              <button
                onClick={() => {
                  setIsbnChecked(true);
                  if (!('error' in isbnRes)) {
                    recordPractice('ch4', userIsbn.trim().toUpperCase() === isbnRes.missingValue);
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
              >
                Verify
              </button>
            </div>
            {isbnChecked && ('error' in isbnRes ? (
              <div className="text-xs text-rose-500">{isbnRes.error}</div>
            ) : (
              <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                Position i={isbnRes.missingIndex1Based}: known weighted sum = {isbnRes.weightedSumKnown} → Missing digit ={' '}
                <strong className="text-emerald-600 dark:text-emerald-400">{isbnRes.missingValue}</strong>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-sm">Affine Cipher Sandbox: f(p) = (ap + b) mod 26</h3>
              <input
                value={affineText}
                onChange={(e) => setAffineText(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={affineA}
                  onChange={(e) => setAffineA(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono text-xs"
                />
                <input
                  type="number"
                  value={affineB}
                  onChange={(e) => setAffineB(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono text-xs"
                />
              </div>
              <div className="text-xs font-mono space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                <div>Encrypted: {affineEncrypt(affineText, affineA, affineB)}</div>
                <div>
                  Decrypted:{' '}
                  {(() => {
                    try {
                      const d = affineDecrypt(affineText, affineA, affineB);
                      return `${d.plaintext} (a⁻¹=${d.aInv})`;
                    } catch (e) {
                      return e instanceof Error ? e.message : 'Invalid a';
                    }
                  })()}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="font-bold text-sm">RSA Small-Key Sandbox (A=0..Z=25)</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="number"
                  value={rsaN}
                  onChange={(e) => setRsaN(Number(e.target.value))}
                  placeholder="n = pq"
                  className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono"
                />
                <input
                  type="number"
                  value={rsaE}
                  onChange={(e) => setRsaE(Number(e.target.value))}
                  placeholder="e"
                  className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono"
                />
                <input
                  value={rsaWord}
                  onChange={(e) => setRsaWord(e.target.value)}
                  placeholder="Plain word"
                  className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono"
                />
                <input
                  value={rsaCipherNums}
                  onChange={(e) => setRsaCipherNums(e.target.value)}
                  placeholder="Cipher numbers"
                  className="px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 font-mono"
                />
              </div>
              {rsaRes.error || !rsaRes.fac || !rsaRes.encrypted || !rsaRes.decrypted ? (
                <div className="text-xs text-rose-500">{rsaRes.error ?? 'Invalid RSA parameters'}</div>
              ) : (
                <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-1">
                  <div>
                    p={rsaRes.fac.p}, q={rsaRes.fac.q}, φ(n)={rsaRes.fac.phi}, d={rsaRes.d}
                  </div>
                  <div>
                    Encrypt &quot;{rsaWord.toUpperCase()}&quot;:{' '}
                    {rsaRes.encrypted.map((x) => `${x.ch}(${x.m})→${x.c}`).join(', ')}
                  </div>
                  <div>
                    Decrypt [{rsaCipherNums}]:{' '}
                    {rsaRes.decrypted.map((x) => `${x.c}→${x.m}(${x.ch})`).join(', ')} ⇒{' '}
                    <strong>{rsaRes.decrypted.map((x) => x.ch).join('')}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
