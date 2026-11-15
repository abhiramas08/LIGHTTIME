# LIGHTTIME: Scientific & Engineering Assumptions

This document articulates the baseline scientific constants, physiological relationships, environmental parameters, and life support equations applied in the LIGHTTIME simulation engine.

All equations and constants are derived from publicly available aerospace engineering literature, NASA technical reports (including NASA-STD-3001 and NASA SP-2008-540), and established biophysical models.

---

## 1. Physical & Orbital Constants

| Parameter | Symbol | Value | Unit | Context / Source |
| :--- | :--- | :--- | :--- | :--- |
| Speed of Light in Vacuum | $c$ | $299,792,458$ | $\text{m/s}$ | Metric standard |
| Earth-Moon Mean Distance | $d_{\text{mean}}$ | $384,400$ | $\text{km}$ | Center-to-center |
| Lunar Perigee (Closest) | $d_{\text{min}}$ | $363,300$ | $\text{km}$ | Elliptical orbit |
| Lunar Apogee (Farthest) | $d_{\text{max}}$ | $405,500$ | $\text{km}$ | Elliptical orbit |
| One-Way Light-Time (Mean) | $\tau_{\text{mean}}$ | $1.282$ | $\text{s}$ | $\tau = d / c$ |
| Round-Trip Communication Delay | $2\tau$ | $2.564$ | $\text{s}$ | Ping latency |
| Lunar Surface Gravity | $g_{\text{moon}}$ | $1.62$ | $\text{m/s}^2$ | $\approx 0.166\,g_{\text{earth}}$ |
| Lunar Synodic Day (Diurnal Cycle) | $T_{\text{lunar}}$ | $29.53$ | Earth days | $\approx 708.7$ hours ($354\text{h}$ day, $354\text{h}$ night) |
| Solar Irradiance at 1 AU | $S_0$ | $1361$ | $\text{W/m}^2$ | Solar constant at lunar distance |
| Lunar Equatorial Surface Temp (Day) | $T_{\text{day}}$ | $\approx 390$ | $\text{K}$ ($+120^\circ\text{C}$) | High noon |
| Lunar Equatorial Surface Temp (Night)| $T_{\text{night}}$ | $\approx 100$ | $\text{K}$ ($-130^\circ\text{C}$) | Deep night |
| South Pole PSR Temperature | $T_{\text{PSR}}$ | $40$ to $90$ | $\text{K}$ ($-233^\circ\text{C}$) | Permanently Shadowed Regions |

---

## 2. Atmospheric & Life Support (ECLSS) Baselines

LIGHTTIME models a closed-loop habitat with nominal exploration atmospheric parameters (based on the NASA Exploration Atmospheres Technical Interchange guidelines):

### 2.1 Nominal Cabin Atmosphere (Standard Exploration Baseline)
- **Total Cabin Pressure ($P_{\text{total}}$):** $56.5\text{ kPa}$ ($8.2\text{ psi}$) or optional sea-level mode $101.3\text{ kPa}$ ($14.7\text{ psi}$).
  - *Note on $56.5\text{ kPa}$ exploration atmosphere:* Allows faster EVA prebreathe protocols, reducing pure $O_2$ prebreathe time from hours down to ~20 minutes.
- **Oxygen Partial Pressure ($ppO_2$):** $19.3\text{ kPa}$ to $22.7\text{ kPa}$ (Nominal target: $20.0\text{ kPa}$, maintaining normoxic equivalent sea-level alveoli partial pressure).
- **Carbon Dioxide Partial Pressure ($ppCO_2$):**
  - Nominal: $< 0.40\text{ kPa}$ ($< 3.0\text{ mmHg}$)
  - Caution limit: $\ge 0.53\text{ kPa}$ ($4.0\text{ mmHg}$) – onset of headache and mild cognitive decline.
  - Abort limit: $\ge 1.0\text{ kPa}$ ($7.5\text{ mmHg}$) – hypercapnia, severe impaired operational readiness.
- **Cabin Relative Humidity:** $30\% - 60\%$ (condenser dew point $4^\circ\text{C}$ to $15^\circ\text{C}$).
- **Cabin Ambient Temperature:** $21^\circ\text{C} \pm 2^\circ\text{C}$ ($294\text{ K}$).

### 2.2 Human Metabolic Consumption & Excretion (Per Astronaut / Sol)

Based on NASA Human Integration Design Handbook (HIDH) for an active crew member (mean body mass $75\text{ kg}$, mixed EVA and habitat ops):

$$\begin{aligned}
\text{Oxygen Consumption } (\dot{m}_{O_2}) &= 0.84\text{ kg/day} \quad (583\text{ L/day at STP}) \\
\text{Carbon Dioxide Exhalation } (\dot{m}_{CO_2}) &= 1.00\text{ kg/day} \quad (509\text{ L/day at STP}) \\
\text{Drinking Water Required} &= 2.50\text{ kg/day} \\
\text{Food Preparation Water} &= 0.50\text{ kg/day} \\
\text{Hygiene Water} &= 4.00\text{ kg/day} \\
\text{Metabolic Caloric Requirement} &= 2,800 - 3,400\text{ kcal/day} \quad (\text{EVA increases to } 4,200\text{ kcal}) \\
\text{Water Recycling Efficiency (Target)} &= 90\% - 95\% \quad (\text{Urine processor + Condensate collector})
\end{aligned}$$

---

## 3. Human Factors & Physiological Mathematical Models

### 3.1 Cumulative Fatigue & Sleep Debt
The cognitive readiness $R_c(t) \in [0, 100]$ of each astronaut is computed as a function of the 24-hour sleep duration $S_{\text{actual}}$, baseline sleep requirement $S_{\text{req}} = 8.0\text{ h}$, cumulative sleep debt $D_s$, and consecutive awake hours $H_{\text{awake}}$:

$$D_s(t) = \max\left(0, D_s(t-1) + (S_{\text{req}} - S_{\text{actual}}(t)) \times 0.8\right)$$

Cognitive Readiness degradation formula:
$$R_c(t) = R_0 - (1.5 \times D_s(t)) - \Phi(H_{\text{awake}}) - \Gamma(W_{\text{workload}})$$

Where:
- $\Phi(H_{\text{awake}}) = 0.8 \times \max(0, H_{\text{awake}} - 14)^{1.4}$ accounts for sustained wakefulness degradation.
- $\Gamma(W_{\text{workload}})$ penalizes sustained high-intensity activities (e.g. 7-hour lunar EVA).

### 3.2 Radiation Exposure Model
The lunar surface lacks a global magnetic field and significant atmosphere. Astronauts receive radiation from two sources:
1. **Galactic Cosmic Radiation (GCR):** Continuous background omnidirectional flux.
   - Mean unshielded rate: $\approx 1.5\text{ mSv/day}$ at solar minimum; $\approx 0.8\text{ mSv/day}$ at solar maximum.
   - Inside habitat (shielded by $10\text{ g/cm}^2$ water/regolith shielding): $\approx 0.4\text{ mSv/day}$.
2. **Solar Particle Events (SPE / Solar Flares):** Sporadic high-energy coronal mass ejections.
   - Unshielded dose rate during severe flare: $50\text{ mSv/h}$ to $> 500\text{ mSv/h}$ (lethal within hours if unmitigated).
   - Storm Shelter threshold: When flux $> 10\text{ pfu}$ ($E > 10\text{ MeV}$), crew must retreat to the internal radiation storm shelter ($> 25\text{ g/cm}^2$ shielding).

*Career and 30-Day Mission Thresholds (NASA-STD-3001):*
- 30-Day limit: $250\text{ mSv}$ (prevent acute radiation sickness / hematopoietic damage).
- Career limit: $600\text{ mSv}$ (gender and age standardized cancer mortality risk threshold).

---

## 4. Communication & Light-Time Latency Rules

Earth-Moon distance varies along the eccentric orbit:
$$d(t) = a \frac{1 - e^2}{1 + e \cos(\nu(t))}$$
where semi-major axis $a = 384,400\text{ km}$, eccentricity $e = 0.0549$, and true anomaly $\nu(t)$ advances over the 27.3-day anomalistic month.

1. **One-Way Delay ($\tau$):**
   $$\tau(t) = \frac{d(t)}{c} \in [1.212\text{ s}, 1.353\text{ s}]$$
2. **Packet Transit Pipeline:**
   - Uplink: Ground sends command at $t_0$.
   - Habitat Reception & Verification: Arrives at $t_0 + \tau(t)$.
   - Autonomous Habitat or Crew Execution: Commences at $t_{\text{exec}} \ge t_0 + \tau(t)$.
   - Downlink Telemetry Packet: Dispatched from Moon at $t_{\text{exec}}$.
   - Ground Display Update: Visible to Commander at $t_0 + 2\tau(t)$.
3. **Loss-of-Signal (LOS) Periods:**
   - Ground station handovers between Goldstone, Madrid, and Canberra Deep Space Network (DSN) complexes or lunar orbital relay occlusions create scheduled or stochastic comms blackouts lasting between 45 seconds and 15 minutes.
   - During LOS, the crew must rely strictly on autonomous local systems and on-board flight rules.

---

## 5. Educational Simplification Guardrails

While the simulation maintains high fidelity, certain simplifications are deliberately made to preserve accessibility for student operators:
1. Fluid dynamics and valve-level gas flows are lumped into zero-dimensional compartment control volumes.
2. Radiation dose equivalent is simplified into effective dose in Sieverts ($mSv$) using standard ICRP weighting factors rather than full Monte Carlo particle transport simulation.
3. Orbital mechanics for translunar injection (TLI) and orbit insertion are treated as completed mission phases; the 30-day timeline concentrates on surface habitat operations and EVA sorties.
