import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Home, Info, Phone, Menu, X, MapPin, QrCode, Loader2, ScanLine } from 'lucide-react';
import { QrReader } from 'react-qr-reader';

interface ParkingSlot {
  id: string;
  occupied: boolean;
  qrCode?: string | null;
}

interface ParkingLocation {
  id: string;
  name: string;
  description: string;
  image: string;
}

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-blue-600 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-white text-center"
      >
        <Car className="w-20 h-20 mb-4 mx-auto" />
        <h1 className="text-3xl font-bold">Smart Parking System</h1>
      </motion.div>
    </motion.div>
  );
}

function QRScanner({ onClose, onSlotUpdate }: { onClose: () => void; onSlotUpdate: () => void }) {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [scannedSlot, setScannedSlot] = useState<string>('');

  const handleScan = async (data?: string) => {
    try {
      const slotId = data || scannedSlot || 'A1'; // Use scanned data or input, default to A1
      const response = await fetch('http://localhost:3000/api/slots/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber: slotId }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update slot status');
      }

      setSuccess(true);
      onSlotUpdate(); // Trigger slot refresh in parent
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to process QR code. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
      >
        <div className="text-center">
          <ScanLine className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold mb-4">Scan Parking QR Code</h2>
          {!success && !error && (
            <>
              <p className="text-gray-600 mb-4">Scan QR code or enter slot number manually</p>
              <QrReader
                onResult={(result, error) => {
                  if (result) {
                    handleScan(result.getText()); // Use getText() instead of result.text
                  }
                  if (error) {
                    console.error(error);
                  }
                }}
                constraints={{ facingMode: 'environment' }}
                className="mb-4"
              />
              <input
                type="text"
                value={scannedSlot}
                onChange={(e) => setScannedSlot(e.target.value)}
                placeholder="Enter slot number (e.g., A1)"
                className="w-full p-2 mb-4 border rounded"
              />
              <button
                onClick={() => handleScan()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Toggle Slot
              </button>
            </>
          )}
          {error && (
            <div className="text-red-600 mb-4">
              {error}
              <button
                onClick={() => setError('')}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          {success && (
            <div className="text-green-600 mb-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-4">
                <svg className="w-16 h-16 mx-auto text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              Parking slot updated successfully!
            </div>
          )}
          <button
            onClick={onClose}
            className="mt-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close Scanner
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LocationCard({
  location,
  onSelect,
  onScanQR,
}: {
  location: ParkingLocation;
  onSelect: () => void;
  onScanQR: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <img src={location.image} alt={location.name} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{location.name}</h3>
        <p className="text-gray-600 mb-4">{location.description}</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onSelect}
            className="bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>View Slots</span>
          </button>
          <button
            onClick={onScanQR}
            className="bg-gray-800 text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-900 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50"
    >
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-600">Loading parking information...</p>
    </motion.div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [showParkingSlots, setShowParkingSlots] = useState(false);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [error, setError] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const parkingLocations: ParkingLocation[] = [
    {
      id: 'bel-lab',
      name: 'BEL LAB Parking',
      description: 'Secure parking area near the BEL Laboratory complex',
      image: 'https://images.unsplash.com/photo-1573348722427-f1d6819dd372?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
    {
      id: 'tp1',
      name: 'TP 1 Parking',
      description: 'Convenient parking space at Technology Park 1',
      image: 'https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showParkingSlots) {
      fetchParkingSlots();
    }
  }, [showParkingSlots]);

  const fetchParkingSlots = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:3000/api/slots', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch parking slots');
      }
      const formattedSlots = result.data.map((slot: any) => ({
        id: slot.slot_number,
        occupied: slot.is_occupied,
        qrCode: slot.qr_code,
      }));
      setSlots(formattedSlots); // Show all slots, not just available ones
    } catch (err: any) {
      setError(err.message || 'Failed to load parking slots. Please try again.');
      console.error('Error fetching parking slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: ParkingLocation) => {
    setSelectedLocation(location);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowParkingSlots(true);
    }, 1500);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!showParkingSlots) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-16">
              <div className="flex items-center space-x-2">
                <Car className="h-6 w-6" />
                <h1 className="text-xl font-bold">Smart Parking System</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Select Parking Location</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {parkingLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onSelect={() => handleLocationSelect(location)}
                  onScanQR={() => setShowScanner(true)}
                />
              ))}
            </div>
          </div>
        </main>

        <AnimatePresence>
          {showScanner && (
            <QRScanner onClose={() => setShowScanner(false)} onSlotUpdate={fetchParkingSlots} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {loading && <LoadingScreen />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6" />
              <h1 className="text-xl font-bold">Smart Parking System</h1>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-blue-700 focus:outline-none"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="flex items-center space-x-1 hover:text-blue-200">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </a>
              <a href="#" className="flex items-center space-x-1 hover:text-blue-200">
                <Info className="h-4 w-4" />
                <span>About</span>
              </a>
              <a href="#" className="flex items-center space-x-1 hover:text-blue-200">
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-blue-500"
          >
            <nav className="flex flex-col space-y-2 px-4 py-2">
              <a href="#" className="flex items-center space-x-1 text-white py-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </a>
              <a href="#" className="flex items-center space-x-1 text-white py-2">
                <Info className="h-4 w-4" />
                <span>About</span>
              </a>
              <a href="#" className="flex items-center space-x-1 text-white py-2">
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedLocation?.name} - Parking Slots
          </h2>
          <button
            onClick={() => setShowScanner(true)}
            className="bg-gray-800 text-white py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-gray-900 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR</span>
          </button>
        </div>

        {error && <div className="text-red-600 text-center py-4">{error}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {slots.map((slot) => (
            <motion.div
              key={slot.id}
              className={`relative p-6 rounded-lg shadow-md border-2 ${
                slot.occupied ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{slot.id}</h3>
                <p className={`text-sm ${slot.occupied ? 'text-red-600' : 'text-green-600'}`}>
                  {slot.occupied ? 'Occupied' : 'Available'}
                </p>
                {slot.occupied && slot.qrCode && (
                  <QRCodeSVG value={slot.qrCode} size={100} className="mt-2 mx-auto" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {slots.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">No parking slots available yet.</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Smart Parking System. All rights reserved.</p>
        </div>
      </footer>

      <AnimatePresence>
        {showScanner && (
          <QRScanner onClose={() => setShowScanner(false)} onSlotUpdate={fetchParkingSlots} />
        )}
        {loading && <LoadingScreen />}
      </AnimatePresence>
    </div>
  );
}

export default App;