# Quick Start - Face Detection Testing

## 🚀 Start Application (60 seconds)

### Terminal 1: Start Server
```bash
cd C:\Users\ASUS\absensi-pesantren
npm run dev
```

Wait for message:
```
✓ Ready in X.XXs
```

Server runs at: **http://localhost:3000**

## 🔐 Login (30 seconds)

1. Open http://localhost:3000 in Chrome/Firefox
2. Login with:
   - **Email:** stf001@pesantren.ac.id
   - **Password:** staf123
3. Click "Masuk" button
4. Redirects to dashboard

## 👁️ Test Face Detection (2 minutes)

1. Click **"Absensi"** menu
2. Click **"Dengan Wajah"** (Face Detection)
3. See message: **"Memuat model deteksi wajah..."**
4. Wait for models to load (15-20 seconds)
5. See message: **"Arahkan wajah ke kamera"** ← Models loaded successfully!
6. Allow camera access when prompted
7. Click **"Verifikasi Wajah"** button
8. Point face at camera
9. System detects and verifies your face
10. Success message appears ✓

## ✅ If Models Load Successfully

**"Arahkan wajah ke kamera"** message = ✓ Models loaded!

If you see this, the fix worked. Face detection is now functioning.

## ❌ If Models Still Fail

Error message: **"Gagal memuat model deteksi wajah"**

1. Check browser console (F12 → Console tab)
2. Look for any red error messages
3. Report the exact error message
4. Run: `curl http://localhost:3000/api/test-models`
   - Should show all 6 files with large sizes
   - If sizes are small (< 1KB), models are corrupted

## 🔄 If Server Doesn't Start

**Error:** "Port 3000 in use"
```bash
# Kill existing Node process
Get-Process node | Stop-Process -Force

# Try again
npm run dev
```

**Error:** "Cannot find module"
```bash
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
npm run dev
```

## 📱 Other Test Accounts

```
Admin:
  email: admin@pesantren.ac.id
  password: admin123

More Staff:
  stf002@pesantren.ac.id / staf123
  stf003@pesantren.ac.id / staf123
  stf004@pesantren.ac.id / staf123
```

## 📊 Check Model Status

```bash
# See all model files and sizes
curl http://localhost:3000/api/test-models

# Verify face-api configuration
curl http://localhost:3000/api/test-faceapi
```

## 🎯 What Should Happen

### When Page Loads:
1. ⏳ Shows "Memuat model deteksi wajah..." (loading)
2. ⏳ Takes 15-20 seconds
3. ✓ Shows "Arahkan wajah ke kamera" (ready)

### When You Click "Verifikasi Wajah":
1. Shows "Mendeteksi wajah..." (detecting)
2. Draws detection box around your face
3. Shows recognition status
4. Shows success ✓ or match distance

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Models take forever to load | Browser cache - try Ctrl+Shift+Del, clear cache, reload |
| Camera won't turn on | Check browser camera permissions in settings |
| "Gagal memuat" error | Check F12 console for specific error, run test endpoints |
| Login not working | Check password is exactly "staf123", verify database exists |
| Server won't start | Kill node process, clear .next folder, try again |
| White screen after login | Check browser console for JavaScript errors |

## ⏱️ Expected Timings

- Server startup: 2-3 seconds
- Login: 1-2 seconds  
- Page load: 1-2 seconds
- Model loading: 15-25 seconds
- Face detection: 500ms per cycle

## 💾 Database Check

If you need to verify database is working:

```bash
# Open Prisma Studio (interactive database viewer)
npm run db:studio
```

Opens http://localhost:5555 - see all users and attendance records

## ✨ Success Indicators

- ✓ Server starts without errors
- ✓ Can login to dashboard
- ✓ Face detection page loads
- ✓ Models load (see "Arahkan wajah ke kamera")
- ✓ Camera feed displays
- ✓ Face detection recognizes your face

If all ✓, the face detection is **fully working!**

## 📞 Need Help?

Check these files for detailed information:
- `TESTING_GUIDE.md` - Comprehensive testing instructions
- `FIXES_SUMMARY.md` - What was fixed and why
- Server logs: tail output from `npm run dev`
- Browser console: F12 → Console tab

---

**Status:** ✓ Face detection models are properly downloaded and configured
**Server:** Ready at http://localhost:3000
**Test Accounts:** Created and seeded in database
**Ready to Test:** Yes, follow steps above
