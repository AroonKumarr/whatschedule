# WhatsSchedule REST API Documentation

The WhatsSchedule server exposes a clean RESTful API on port `5001`. All endpoints (except `/api/status` and `/api/auth/status`) require the `Authorization: Bearer <TOKEN>` header obtained after Master PIN verification.

---

## 1. Authentication & Security Endpoints

### Check PIN & Auth Status
`GET /api/auth/status`
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "isPinSet": true,
      "isUnlocked": true
    }
  }
  ```

### Unlock with Master PIN
`POST /api/auth/unlock`
* **Headers**: `Content-Type: application/json`
* **Body**: `{"pin": "54321"}`
* **Response**:
  ```json
  {
    "success": true,
    "token": "4a71ef09c13b...SignedToken"
  }
  ```

---

## 2. WhatsApp Multi-Device Status

### Get Connection Status
`GET /api/status`
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "state": "qr_ready",
      "qrCodeUrl": "data:image/png;base64,...",
      "user": null,
      "lastConnectedAt": null
    }
  }
  ```

### Terminate / Unlink Session
`POST /api/logout`
* **Response**: `{"success": true, "message": "Logged out successfully"}`

---

## 3. Message Scheduling & Immediate Dispatch

### Create a Scheduled Message
`POST /api/schedules`
* **Headers**: `multipart/form-data`
* **Fields**:
  * `recipient` (string, required): Phone number e.g. `15551234567`
  * `recipientName` (string, optional): Contact name e.g. `HR Manager`
  * `content` (string, optional): Message text or caption (up to 65,536 chars)
  * `scheduledAt` (ISO Date string, required): e.g. `2026-10-27T09:00:00.000Z`
  * `media` (file, optional): Video, Image, Audio, or Document (up to 100MB)
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "c138f7d9-...",
      "recipient": "15551234567",
      "status": "pending",
      "scheduledAt": "2026-10-27T09:00:00.000Z"
    }
  }
  ```

### Send Now (Immediate Dispatch)
`POST /api/schedules/:id/send-now`
* **Description**: Bypasses the schedule timer, acquires the recipient mutex, and dispatches immediately.
* **Response**:
  ```json
  {
    "success": true,
    "message": "Message sent successfully",
    "data": {
      "id": "c138f7d9-...",
      "status": "sent",
      "deliveryStatus": "sent",
      "sentAt": "2026-10-26T01:45:00.000Z"
    }
  }
  ```

### Cancel a Scheduled Message
`POST /api/schedules/:id/cancel`
* **Response**: `{"success": true, "data": {"id": "...", "status": "cancelled"}}`

### Retry a Failed Message
`POST /api/schedules/:id/retry`
* **Response**: `{"success": true, "data": {"id": "...", "status": "pending"}}`

### Delete a Scheduled Message
`DELETE /api/schedules/:id`
* **Response**: `{"success": true, "data": {"id": "..."}}`

---

## 4. Emergency Queue Controls

### Emergency Pause
`POST /api/queue/pause`
* **Response**: `{"success": true, "message": "All scheduled message dispatches paused"}`

### Resume Queue
`POST /api/queue/resume`
* **Response**: `{"success": true, "message": "Scheduled message dispatches resumed"}`

---

## 5. AI Drafting Assistant

### Generate Smart Message Draft
`POST /api/ai/draft`
* **Headers**: `Content-Type: application/json`
* **Body**:
  ```json
  {
    "prompt": "Follow up with HR about my salary slip politely",
    "tone": "professional",
    "recipientRole": "HR Manager"
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "draft": "Dear HR Team, I hope you are having a productive week. I am writing to kindly check on the status of my salary slip for this month. Please let me know if any information is needed from my side. Thank you!",
      "model": "qwen3.8-27b",
      "cached": false
    }
  }
  ```
