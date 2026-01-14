import React, { useState, useEffect } from 'react';

import { Menu, Plus, Trash2, Edit2, Save, X } from 'lucide-react';



const VisionBoardApp = () => {

  const [page, setPage] = useState('vision');

  const [menuOpen, setMenuOpen] = useState(false);

  const [collages, setCollages] = useState([]);

  const [selectedCollageId, setSelectedCollageId] = useState(null);

  const [editingCollage, setEditingCollage] = useState(null);

  const [historyRows, setHistoryRows] = useState([]);

  const [editingRow, setEditingRow] = useState(null);



  useEffect(() => {

    loadData();

  }, []);



  const loadData = async () => {

    try {

      const collagesData = await window.storage.get('collages');

      const historyData = await window.storage.get('history');

      

      if (collagesData) {

        const parsed = JSON.parse(collagesData.value);

        setCollages(parsed);

        if (parsed.length > 0 && !selectedCollageId) {

          setSelectedCollageId(parsed[0].id);

        }

      }

      

      if (historyData) {

        setHistoryRows(JSON.parse(historyData.value));

      }

    } catch (e) {

      console.log('No saved data found');

    }

  };



  const saveCollages = async (newCollages) => {

    await window.storage.set('collages', JSON.stringify(newCollages));

    setCollages(newCollages);

  };



  const saveHistory = async (newHistory) => {

    await window.storage.set('history', JSON.stringify(newHistory));

    setHistoryRows(newHistory);

  };



  const handleFileSelect = (e, callback) => {

    const files = Array.from(e.target.files);

    const readers = files.map(file => {

      return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = (event) => resolve(event.target.result);

        reader.readAsDataURL(file);

      });

    });



    Promise.all(readers).then(images => {

      callback(images);

    });

  };



  const createCollage = (images) => {

    const newCollage = {

      id: Date.now(),

      name: `Vision Board ${collages.length + 1}`,

      photos: images.map((img, i) => ({

        id: Date.now() + i,

        src: img,

        x: Math.random() * 60 + 10,

        y: Math.random() * 60 + 10,

        rotation: Math.random() * 20 - 10,

        scale: Math.random() * 0.3 + 0.8

      }))

    };

    

    const updated = [...collages, newCollage];

    saveCollages(updated);

    setSelectedCollageId(newCollage.id);

  };



  const updateCollage = (id, updates) => {

    const updated = collages.map(c => c.id === id ? { ...c, ...updates } : c);

    saveCollages(updated);

  };



  const deleteCollage = (id) => {

    const updated = collages.filter(c => c.id !== id);

    saveCollages(updated);

    if (selectedCollageId === id && updated.length > 0) {

      setSelectedCollageId(updated[0].id);

    }

  };



  const addHistoryRow = () => {

    const newRow = {

      id: Date.now(),

      text: 'New entry',

      photos: []

    };

    const updated = [...historyRows, newRow];

    saveHistory(updated);

  };



  const updateHistoryRow = (id, updates) => {

    const updated = historyRows.map(r => r.id === id ? { ...r, ...updates } : r);

    saveHistory(updated);

  };



  const deleteHistoryRow = (id) => {

    const updated = historyRows.filter(r => r.id !== id);

    saveHistory(updated);

  };



  const selectedCollage = collages.find(c => c.id === selectedCollageId);



  return (

    <div className="h-screen bg-black text-white overflow-hidden">

      {/* Header */}

      <div className="absolute top-0 right-0 z-50 p-4">

        <button

          onClick={() => setMenuOpen(!menuOpen)}

          className="p-2 hover:bg-gray-800 rounded"

        >

          <Menu size={24} />

        </button>

      </div>



      {/* Side Menu */}

      {menuOpen && (

        <div className="absolute top-0 right-0 w-64 h-full bg-gray-900 shadow-lg z-40 p-6">

          <div className="flex flex-col gap-4 mt-16">

            <button

              onClick={() => { setPage('vision'); setMenuOpen(false); }}

              className="text-left p-3 hover:bg-gray-800 rounded"

            >

              Vision

            </button>

            <button

              onClick={() => { setPage('history'); setMenuOpen(false); }}

              className="text-left p-3 hover:bg-gray-800 rounded"

            >

              History

            </button>

          </div>

        </div>

      )}



      {/* Vision Page */}

      {page === 'vision' && (

        <div className="h-full p-8">

          <div className="flex gap-4 mb-6">

            <select

              value={selectedCollageId || ''}

              onChange={(e) => setSelectedCollageId(Number(e.target.value))}

              className="px-4 py-2 bg-gray-800 rounded text-white"

            >

              {collages.map(c => (

                <option key={c.id} value={c.id}>{c.name}</option>

              ))}

            </select>

            

            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer">

              <Plus size={20} className="inline mr-2" />

              New Collage

              <input

                type="file"

                multiple

                accept="image/*"

                className="hidden"

                onChange={(e) => handleFileSelect(e, createCollage)}

              />

            </label>



            {selectedCollage && (

              <>

                <button

                  onClick={() => setEditingCollage(selectedCollage)}

                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"

                >

                  <Edit2 size={20} className="inline mr-2" />

                  Edit

                </button>

                <button

                  onClick={() => deleteCollage(selectedCollageId)}

                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"

                >

                  <Trash2 size={20} />

                </button>

              </>

            )}

          </div>



          {/* Collage Display */}

          {selectedCollage && (

            <div className="relative w-full h-[calc(100%-80px)] bg-black rounded">

              {selectedCollage.photos.map(photo => (

                <img

                  key={photo.id}

                  src={photo.src}

                  className="absolute w-64 h-48 object-cover shadow-2xl"

                  style={{

                    left: `${photo.x}%`,

                    top: `${photo.y}%`,

                    transform: `rotate(${photo.rotation}deg) scale(${photo.scale})`,

                  }}

                />

              ))}

            </div>

          )}

        </div>

      )}



      {/* History Page */}

      {page === 'history' && (

        <div className="h-full p-8 overflow-y-auto">

          <button

            onClick={addHistoryRow}

            className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"

          >

            <Plus size={20} className="inline mr-2" />

            Add Row

          </button>



          <div className="space-y-4">

            {historyRows.map(row => (

              <div key={row.id} className="flex gap-4 bg-gray-900 p-4 rounded">

                <div 

                  className="w-3/12 cursor-pointer hover:bg-gray-800 p-3 rounded"

                  onClick={() => setEditingRow(row)}

                >

                  <p className="text-sm">{row.text}</p>

                </div>

                <div 

                  className="w-9/12 cursor-pointer hover:bg-gray-800 p-3 rounded min-h-[100px] relative"

                  onClick={() => setEditingRow(row)}

                >

                  {row.photos.map((photo, i) => (

                    <img

                      key={i}

                      src={photo.src}

                      className="absolute w-24 h-24 object-cover shadow-lg"

                      style={{

                        left: `${photo.x}%`,

                        top: `${photo.y}%`,

                        transform: `rotate(${photo.rotation}deg) scale(${photo.scale})`,

                      }}

                    />

                  ))}

                </div>

                <button

                  onClick={() => deleteHistoryRow(row.id)}

                  className="p-2 hover:bg-red-600 rounded h-fit"

                >

                  <Trash2 size={20} />

                </button>

              </div>

            ))}

          </div>

        </div>

      )}



      {/* Edit Collage Modal */}

      {editingCollage && (

        <CollageEditor

          collage={editingCollage}

          onSave={(updated) => {

            updateCollage(editingCollage.id, updated);

            setEditingCollage(null);

          }}

          onClose={() => setEditingCollage(null)}

        />

      )}



      {/* Edit History Row Modal */}

      {editingRow && (

        <HistoryRowEditor

          row={editingRow}

          onSave={(updated) => {

            updateHistoryRow(editingRow.id, updated);

            setEditingRow(null);

          }}

          onClose={() => setEditingRow(null)}

        />

      )}

    </div>

  );

};



const CollageEditor = ({ collage, onSave, onClose }) => {

  const [name, setName] = useState(collage.name);

  const [photos, setPhotos] = useState(collage.photos);

  const [dragging, setDragging] = useState(null);

  const [rotating, setRotating] = useState(null);



  const handleMouseDown = (e, photo, action) => {

    e.preventDefault();

    if (action === 'drag') setDragging(photo.id);

    else setRotating(photo.id);

  };



  const handleMouseMove = (e) => {

    if (dragging) {

      const rect = e.currentTarget.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * 100;

      const y = ((e.clientY - rect.top) / rect.height) * 100;

      

      setPhotos(photos.map(p => 

        p.id === dragging ? { ...p, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) } : p

      ));

    } else if (rotating) {

      setPhotos(photos.map(p => 

        p.id === rotating ? { ...p, rotation: (p.rotation + 5) % 360 } : p

      ));

    }

  };



  const handleMouseUp = () => {

    setDragging(null);

    setRotating(null);

  };



  const addPhotos = (images) => {

    const newPhotos = images.map((img, i) => ({

      id: Date.now() + i,

      src: img,

      x: Math.random() * 60 + 10,

      y: Math.random() * 60 + 10,

      rotation: Math.random() * 20 - 10,

      scale: Math.random() * 0.3 + 0.8

    }));

    setPhotos([...photos, ...newPhotos]);

  };



  const removePhoto = (id) => {

    setPhotos(photos.filter(p => p.id !== id));

  };



  const handleFileSelect = (e) => {

    const files = Array.from(e.target.files);

    const readers = files.map(file => {

      return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = (event) => resolve(event.target.result);

        reader.readAsDataURL(file);

      });

    });



    Promise.all(readers).then(addPhotos);

  };



  return (

    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8">

      <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-full flex flex-col">

        <div className="p-6 border-b border-gray-700 flex justify-between items-center">

          <input

            type="text"

            value={name}

            onChange={(e) => setName(e.target.value)}

            className="text-2xl bg-transparent border-none outline-none"

          />

          <div className="flex gap-2">

            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer">

              <Plus size={20} className="inline mr-2" />

              Add Photos

              <input

                type="file"

                multiple

                accept="image/*"

                className="hidden"

                onChange={handleFileSelect}

              />

            </label>

            <button

              onClick={() => onSave({ name, photos })}

              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"

            >

              <Save size={20} className="inline mr-2" />

              Save

            </button>

            <button

              onClick={onClose}

              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"

            >

              <X size={20} />

            </button>

          </div>

        </div>

        

        <div 

          className="flex-1 relative bg-black m-4 rounded"

          onMouseMove={handleMouseMove}

          onMouseUp={handleMouseUp}

          onMouseLeave={handleMouseUp}

        >

          {photos.map(photo => (

            <div

              key={photo.id}

              className="absolute group"

              style={{

                left: `${photo.x}%`,

                top: `${photo.y}%`,

                transform: `rotate(${photo.rotation}deg) scale(${photo.scale})`,

              }}

            >

              <img

                src={photo.src}

                className="w-64 h-48 object-cover shadow-2xl cursor-move"

                onMouseDown={(e) => handleMouseDown(e, photo, 'drag')}

                draggable={false}

              />

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">

                <button

                  onMouseDown={(e) => handleMouseDown(e, photo, 'rotate')}

                  className="p-1 bg-blue-600 rounded"

                >

                  ↻

                </button>

                <button

                  onClick={() => removePhoto(photo.id)}

                  className="p-1 bg-red-600 rounded"

                >

                  <X size={16} />

                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

};



const HistoryRowEditor = ({ row, onSave, onClose }) => {

  const [text, setText] = useState(row.text);

  const [photos, setPhotos] = useState(row.photos);

  const [dragging, setDragging] = useState(null);

  const [rotating, setRotating] = useState(null);



  const handleMouseDown = (e, photo, action) => {

    e.preventDefault();

    if (action === 'drag') setDragging(photo.id);

    else setRotating(photo.id);

  };



  const handleMouseMove = (e) => {

    if (dragging) {

      const rect = e.currentTarget.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * 100;

      const y = ((e.clientY - rect.top) / rect.height) * 100;

      

      setPhotos(photos.map(p => 

        p.id === dragging ? { ...p, x: Math.max(0, Math.min(80, x)), y: Math.max(0, Math.min(80, y)) } : p

      ));

    } else if (rotating) {

      setPhotos(photos.map(p => 

        p.id === rotating ? { ...p, rotation: (p.rotation + 5) % 360 } : p

      ));

    }

  };



  const handleMouseUp = () => {

    setDragging(null);

    setRotating(null);

  };



  const addPhotos = (images) => {

    const newPhotos = images.map((img, i) => ({

      id: Date.now() + i,

      src: img,

      x: Math.random() * 60 + 10,

      y: Math.random() * 60 + 10,

      rotation: Math.random() * 20 - 10,

      scale: 0.6

    }));

    setPhotos([...photos, ...newPhotos]);

  };



  const removePhoto = (id) => {

    setPhotos(photos.filter(p => p.id !== id));

  };



  const handleFileSelect = (e) => {

    const files = Array.from(e.target.files);

    const readers = files.map(file => {

      return new Promise((resolve) => {

        const reader = new FileReader();

        reader.onload = (event) => resolve(event.target.result);

        reader.readAsDataURL(file);

      });

    });



    Promise.all(readers).then(addPhotos);

  };



  return (

    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8">

      <div className="bg-gray-900 rounded-lg w-full max-w-4xl flex flex-col">

        <div className="p-6 border-b border-gray-700 flex justify-between items-center">

          <h3 className="text-xl">Edit History Entry</h3>

          <div className="flex gap-2">

            <button

              onClick={() => onSave({ text, photos })}

              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"

            >

              <Save size={20} className="inline mr-2" />

              Save

            </button>

            <button

              onClick={onClose}

              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"

            >

              <X size={20} />

            </button>

          </div>

        </div>

        

        <div className="p-6">

          <label className="block mb-2 text-sm">Text</label>

          <textarea

            value={text}

            onChange={(e) => setText(e.target.value)}

            className="w-full p-3 bg-gray-800 rounded mb-4"

            rows="3"

          />



          <div className="flex justify-between items-center mb-2">

            <label className="block text-sm">Photos</label>

            <label className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer text-sm">

              <Plus size={16} className="inline mr-1" />

              Add

              <input

                type="file"

                multiple

                accept="image/*"

                className="hidden"

                onChange={handleFileSelect}

              />

            </label>

          </div>



          <div 

            className="relative bg-black rounded h-64"

            onMouseMove={handleMouseMove}

            onMouseUp={handleMouseUp}

            onMouseLeave={handleMouseUp}

          >

            {photos.map(photo => (

              <div

                key={photo.id}

                className="absolute group"

                style={{

                  left: `${photo.x}%`,

                  top: `${photo.y}%`,

                  transform: `rotate(${photo.rotation}deg) scale(${photo.scale})`,

                }}

              >

                <img

                  src={photo.src}

                  className="w-24 h-24 object-cover shadow-lg cursor-move"

                  onMouseDown={(e) => handleMouseDown(e, photo, 'drag')}

                  draggable={false}

                />

                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">

                  <button

                    onMouseDown={(e) => handleMouseDown(e, photo, 'rotate')}

                    className="p-1 bg-blue-600 rounded text-xs"

                  >

                    ↻

                  </button>

                  <button

                    onClick={() => removePhoto(photo.id)}

                    className="p-1 bg-red-600 rounded"

                  >

                    <X size={12} />

                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

  );

};



export default VisionBoardApp;
