# Mija AI PRD

## Vision

Mija AI transforms traditional assembly manuals into interactive 3D,
AI-guided experiences with real-time visual verification.

## Problem

Paper manuals are difficult to follow, cause mistakes, and provide no
feedback.

## Target Users

-   DIY enthusiasts
-   Furniture buyers
-   PC builders
-   Hobbyists

## MVP

-   User authentication
-   Upload/scan a manual
-   Parse manual with GPT-5.6 into structured steps
-   Interactive 3D viewer
-   AI chat assistant
-   Camera verification for current step
-   Progress saving

## User Flow

1.  Sign in
2.  Scan or upload manual
3.  AI identifies product
4.  Interactive 3D assembly begins
5.  Camera verifies each step
6.  Complete build

## Tech Stack

### Frontend

-   React Native (Expo)
-   TypeScript
-   NativeWind
-   React Three Fiber
-   Zustand
-   TanStack Query

### Backend

-   FastAPI
-   Python
-   SQLAlchemy
-   Pydantic

### Database

-   Supabase PostgreSQL

### AI

-   GPT-5.6
-   OpenAI Responses API
-   Vision-capable OpenAI model

### Storage

-   Supabase Storage

## Architecture

Frontend -\> FastAPI -\> GPT-5.6/Vision -\> Supabase

## Team

### Jalel

-   Backend architecture
-   AI integration
-   Database
-   Vision pipeline
-   Deployment
-   DevOps

### Mahdi

-   Mobile UI
-   3D rendering
-   Animations
-   UX
-   Camera interface

## Hackathon Scope

One furniture product with: - 10-15 assembly steps - Interactive 3D - AI
assistant - Camera verification - Progress tracking

## Success Metrics

-   Complete assembly faster than using a paper manual
-   High step verification accuracy
-   Smooth interactive demo under 3 minutes
