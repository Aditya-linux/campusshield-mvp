# CampusShield (MVP)

CampusShield helps students avoid campus scams. Students report suspicious offers with phone, UPI ID, or URLs. An admin reviews reports and publishes verified alerts. Anyone can search an identifier before paying.

## Problem
Campus groups and chats are full of internship fee scams, fake UPI requests, and phishing links. Students lose money because there is no simple “check before you pay” tool for the campus.

## Solution
- Report scams with key identifiers (phone, UPI, URL) + description + proof link
- Admin review flow (approve or reject)
- Approved reports become alerts
- Search page checks an identifier against verified alerts

## Features
- Google Sign-In (Firebase Auth)
- Reports collection with status workflow (pending, approved, rejected)
- Alerts feed with risk tags
- Search by phone, UPI ID, or URL
- Dark/Light mode toggle (persists across pages)

## Tech Stack
- Next.js (App Router)
- Firebase Authentication
- Cloud Firestore

## Firestore Collections
- `reports` (user submissions)
- `alerts` (published verified alerts)
- `admin` (admin role docs)

## Local Setup
1. Install deps
   - `npm install`
2. Add Firebase env
   - Create `.env.local` with your Firebase config keys
3. Run
   - `npm run dev`
4. Open
   - `http://localhost:3000`

## Demo Flow
1. Sign in
2. Submit a report (`/report`)
3. Approve it as admin (`/admin`)
4. View it in alerts (`/alerts`)
5. Search identifier (`/check`)
