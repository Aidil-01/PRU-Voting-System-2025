import React, { useState, useEffect } from 'react';
import { 
  FlagIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { partiesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Parties = () => {
  const [parties, setParties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParties, setFilteredParties] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [newParty, setNewParty] = useState({
    name: '',
    abbreviation: '',
    color: '#3B82F6',
    description: '',
    logo: null
  });
  const [editParty, setEditParty] = useState({
    id: '',
    name: '',
    abbreviation: '',
    color: '',
    description: '',
    logo: null
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [editLogoPreview, setEditLogoPreview] = useState(null);

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    const filtered = parties.filter(party =>
      party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredParties(filtered);
  }, [parties, searchTerm]);

  const loadParties = async () => {
    try {
      const response = await partiesAPI.getAll();
      setParties(response.data);
    } catch (error) {
      console.error('Error loading parties:', error);
      toast.error('Gagal memuat senarai parti');
    }
  };

  const handleLogoChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Saiz fail terlalu besar. Maksimum 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Hanya fail gambar yang dibenarkan');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (isEdit) {
          setEditLogoPreview(e.target.result);
        } else {
          setLogoPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);

      if (isEdit) {
        setEditParty({...editParty, logo: file});
      } else {
        setNewParty({...newParty, logo: file});
      }
    }
  };

  const handleAddParty = async (e) => {
    e.preventDefault();
    try {
      await partiesAPI.add(newParty);
      toast.success('Parti berjaya didaftarkan');
      setNewParty({ name: '', abbreviation: '', color: '#3B82F6', description: '', logo: null });
      setLogoPreview(null);
      setShowAddForm(false);
      loadParties();
    } catch (error) {
      console.error('Error adding party:', error);
      toast.error(error.response?.data?.error || 'Gagal mendaftarkan parti');
    }
  };

  const handleViewParty = async (party) => {
    const confirmed = window.confirm(`Adakah anda ingin melihat maklumat untuk parti "${party.name}"?`);
    if (!confirmed) return;

    try {
      const response = await partiesAPI.getById(party.id);
      setSelectedParty(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error loading party details:', error);
      toast.error('Gagal memuat maklumat parti');
    }
  };

  const handleEditParty = (party) => {
    const confirmed = window.confirm(`Adakah anda ingin mengedit parti "${party.name}"?`);
    if (!confirmed) return;

    setEditParty({
      id: party.id,
      name: party.name,
      abbreviation: party.abbreviation || '',
      color: party.color,
      description: party.description || '',
      logo: null
    });
    setEditLogoPreview(null);
    setShowEditForm(true);
  };

  const handleUpdateParty = async (e) => {
    e.preventDefault();
    
    const confirmed = window.confirm(
      `Adakah anda pasti mahu menyimpan perubahan untuk parti "${editParty.name}"?`
    );
    
    if (!confirmed) return;

    try {
      await partiesAPI.update(editParty.id, editParty);
      toast.success(`Parti "${editParty.name}" berjaya dikemaskini`);
      setShowEditForm(false);
      setEditParty({ id: '', name: '', abbreviation: '', color: '', description: '', logo: null });
      setEditLogoPreview(null);
      loadParties();
    } catch (error) {
      console.error('Error updating party:', error);
      toast.error(error.response?.data?.error || `Gagal mengemaskini parti "${editParty.name}"`);
    }
  };

  const handleDeleteParty = async (party) => {
    if (party.vote_count > 0) {
      toast.error(`Tidak boleh padam parti "${party.name}" yang telah menerima undi`);
      return;
    }

    const confirmed = window.confirm(
      `⚠️ AMARAN: Tindakan ini tidak boleh dibatalkan!\n\n` +
      `Adakah anda pasti mahu memadamkan parti "${party.name}"?\n\n` +
      `Semua maklumat parti ini akan dipadamkan secara kekal.`
    );

    if (confirmed) {
      // Double confirmation untuk delete action
      const doubleConfirmed = window.confirm(
        `Pengesahan terakhir: Padam parti "${party.name}"?\n\n` +
        `Klik OK untuk meneruskan atau Cancel untuk membatalkan.`
      );

      if (doubleConfirmed) {
        try {
          await partiesAPI.delete(party.id);
          toast.success(`Parti "${party.name}" berjaya dipadamkan`);
          loadParties();
        } catch (error) {
          console.error('Error deleting party:', error);
          toast.error(error.response?.data?.error || `Gagal memadamkan parti "${party.name}"`);
        }
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${logoPath}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Senarai Parti Politik</h1>
          <p className="text-gray-600 mt-2">Urus parti politik yang bertanding</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Tambah Parti</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, singkatan atau deskripsi parti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="ml-4 text-sm text-gray-600">
            {searchTerm ? (
              <>
                Menunjukkan <span className="font-semibold text-gray-900">{filteredParties.length}</span> daripada{' '}
                <span className="font-semibold text-gray-900">{parties.length}</span> parti
              </>
            ) : (
              <>
                Jumlah: <span className="font-semibold text-gray-900">{parties.length}</span> parti
              </>
            )}
          </div>
        </div>
      </div>

      {/* Parties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParties.map((party) => (
          <div key={party.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* Party Header */}
            <div className="p-6 pb-4">
              {/* Action buttons - moved to top right corner */}
              <div className="flex justify-end mb-3">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleViewParty(party)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title={`Lihat maklumat - ${party.name}`}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditParty(party)}
                    className={`p-2 rounded-lg transition-colors ${
                      party.vote_count > 0 
                        ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' 
                        : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                    }`}
                    title={`Edit ${party.name}${party.vote_count > 0 ? ' (Parti ini sudah ada undi)' : ''}`}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteParty(party)}
                    className={`p-2 rounded-lg transition-colors ${
                      party.vote_count > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                    }`}
                    title={
                      party.vote_count > 0 
                        ? `Tidak boleh padam ${party.name} - parti ini sudah ada ${party.vote_count} undi`
                        : `Padam ${party.name}`
                    }
                    disabled={party.vote_count > 0}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Party info - now has full width */}
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: party.color }}
                >
                  {party.logo_path ? (
                    <img 
                      src={getLogoUrl(party.logo_path)} 
                      alt={party.name}
                      className="h-8 w-8 object-contain rounded"
                    />
                  ) : (
                    <FlagIcon className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">{party.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm font-medium px-2 py-1 rounded-full" style={{ 
                      backgroundColor: party.color + '20', 
                      color: party.color 
                    }}>
                      {party.abbreviation || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {party.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{party.description}</p>
              )}
            </div>

            {/* Party Stats */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <UsersIcon className="h-4 w-4" />
                  <span>{party.vote_count} undi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: party.color }}
                  ></div>
                  <span className="text-xs text-gray-500">{party.color}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredParties.length === 0 && (
        <div className="text-center py-12">
          <FlagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tiada parti dijumpai</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Cuba cari dengan kata kunci lain' : 'Mulakan dengan menambah parti politik'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Tambah Parti</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Party Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Parti Baru</h3>
            <form onSubmit={handleAddParty} className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Parti (opsional)</label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoChange(e)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG hingga 5MB</p>
                  </div>
                  {logoPreview && (
                    <div className="flex-shrink-0">
                      <img src={logoPreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Parti</label>
                <input
                  type="text"
                  required
                  value={newParty.name}
                  onChange={(e) => setNewParty({...newParty, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama parti"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Singkatan</label>
                <input
                  type="text"
                  value={newParty.abbreviation}
                  onChange={(e) => setNewParty({...newParty, abbreviation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: BN, PH, PN"
                  maxLength="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warna Parti</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={newParty.color}
                    onChange={(e) => setNewParty({...newParty, color: e.target.value})}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newParty.color}
                    onChange={(e) => setNewParty({...newParty, color: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  rows="3"
                  value={newParty.description}
                  onChange={(e) => setNewParty({...newParty, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi parti..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setLogoPreview(null);
                    setNewParty({ name: '', abbreviation: '', color: '#3B82F6', description: '', logo: null });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Party Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Parti</h3>
            <form onSubmit={handleUpdateParty} className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Parti</label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoChange(e, true)}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG hingga 5MB</p>
                  </div>
                  {editLogoPreview && (
                    <div className="flex-shrink-0">
                      <img src={editLogoPreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Parti</label>
                <input
                  type="text"
                  required
                  value={editParty.name}
                  onChange={(e) => setEditParty({...editParty, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama parti"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Singkatan</label>
                <input
                  type="text"
                  value={editParty.abbreviation}
                  onChange={(e) => setEditParty({...editParty, abbreviation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: BN, PH, PN"
                  maxLength="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warna Parti</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={editParty.color}
                    onChange={(e) => setEditParty({...editParty, color: e.target.value})}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={editParty.color}
                    onChange={(e) => setEditParty({...editParty, color: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  rows="3"
                  value={editParty.description}
                  onChange={(e) => setEditParty({...editParty, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi parti..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditLogoPreview(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Kemaskini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Party Modal */}
      {showViewModal && selectedParty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Maklumat Parti</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Party Header */}
              <div className="flex items-center space-x-4 p-6 rounded-lg" style={{ backgroundColor: selectedParty.party.color + '10' }}>
                <div 
                  className="h-20 w-20 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedParty.party.color }}
                >
                  {selectedParty.party.logo_path ? (
                    <img 
                      src={getLogoUrl(selectedParty.party.logo_path)} 
                      alt={selectedParty.party.name}
                      className="h-12 w-12 object-contain rounded"
                    />
                  ) : (
                    <FlagIcon className="h-10 w-10 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900">{selectedParty.party.name}</h4>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
                      backgroundColor: selectedParty.party.color, 
                      color: 'white' 
                    }}>
                      {selectedParty.party.abbreviation || 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">{selectedParty.party.color}</span>
                  </div>
                  {selectedParty.party.description && (
                    <p className="text-gray-600 mt-2">{selectedParty.party.description}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{selectedParty.party.vote_count}</p>
                  <p className="text-sm text-gray-600">Jumlah Undi</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {selectedParty.party.percentage || 0}%
                  </p>
                  <p className="text-sm text-gray-600">Peratusan</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">{selectedParty.village_distribution.length}</p>
                  <p className="text-sm text-gray-600">Kampung Menang</p>
                </div>
              </div>

              {/* Village Distribution */}
              {selectedParty.village_distribution.length > 0 && (
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-3">Sebaran Undi Mengikut Kampung</h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {selectedParty.village_distribution.map((village, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded">
                          <span className="font-medium text-gray-900">{village.village_name}</span>
                          <span className="text-lg font-bold" style={{ color: selectedParty.party.color }}>
                            {village.vote_count} undi
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Voters List */}
              {selectedParty.voters.length > 0 && (
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-3">
                    Senarai Pengundi ({selectedParty.voters.length} orang)
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedParty.voters.map((voter) => (
                        <div key={voter.id} className="flex items-center justify-between p-3 bg-white rounded">
                          <div>
                            <p className="font-medium text-gray-900">{voter.name}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{voter.ic_number}</span>
                              <span>•</span>
                              <span>{voter.village_name}</span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                              <span>Mengundi</span>
                            </div>
                            <p>{new Date(voter.voted_at).toLocaleString('ms-MY')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                onClick={() => {
                  const confirmed = window.confirm(`Adakah anda ingin mengedit parti "${selectedParty.party.name}"?`);
                  if (confirmed) {
                    setShowViewModal(false);
                    setEditParty({
                      id: selectedParty.party.id,
                      name: selectedParty.party.name,
                      abbreviation: selectedParty.party.abbreviation || '',
                      color: selectedParty.party.color,
                      description: selectedParty.party.description || '',
                      logo: null
                    });
                    setEditLogoPreview(null);
                    setShowEditForm(true);
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parties;