import React, { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { villagesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Villages = () => {
  const [villages, setVillages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVillages, setFilteredVillages] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [newVillage, setNewVillage] = useState({
    name: '',
    description: ''
  });
  const [editVillage, setEditVillage] = useState({
    id: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    loadVillages();
  }, []);

  useEffect(() => {
    const filtered = villages.filter(village =>
      village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      village.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVillages(filtered);
  }, [villages, searchTerm]);

  const loadVillages = async () => {
    try {
      const response = await villagesAPI.getAll();
      setVillages(response.data);
    } catch (error) {
      console.error('Error loading villages:', error);
      toast.error('Gagal memuat senarai kampung');
    }
  };

  const handleAddVillage = async (e) => {
    e.preventDefault();
    try {
      await villagesAPI.add(newVillage);
      toast.success('Kampung berjaya didaftarkan');
      setNewVillage({ name: '', description: '' });
      setShowAddForm(false);
      loadVillages();
    } catch (error) {
      console.error('Error adding village:', error);
      toast.error(error.response?.data?.error || 'Gagal mendaftarkan kampung');
    }
  };

  const handleViewVillage = async (village) => {
    try {
      const response = await villagesAPI.getById(village.id);
      setSelectedVillage(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error loading village details:', error);
      toast.error('Gagal memuat maklumat kampung');
    }
  };

  const handleEditVillage = (village) => {
    setEditVillage({
      id: village.id,
      name: village.name,
      description: village.description || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateVillage = async (e) => {
    e.preventDefault();
    try {
      await villagesAPI.update(editVillage.id, {
        name: editVillage.name,
        description: editVillage.description
      });
      toast.success('Kampung berjaya dikemaskini');
      setShowEditForm(false);
      setEditVillage({ id: '', name: '', description: '' });
      loadVillages();
    } catch (error) {
      console.error('Error updating village:', error);
      toast.error(error.response?.data?.error || 'Gagal mengemaskini kampung');
    }
  };

  const handleDeleteVillage = async (village) => {
    if (village.voter_count > 0) {
      toast.error('Tidak boleh padam kampung yang mempunyai pengundi');
      return;
    }

    if (window.confirm(`Adakah anda pasti mahu memadamkan kampung ${village.name}?`)) {
      try {
        await villagesAPI.delete(village.id);
        toast.success('Kampung berjaya dipadamkan');
        loadVillages();
      } catch (error) {
        console.error('Error deleting village:', error);
        toast.error(error.response?.data?.error || 'Gagal memadamkan kampung');
      }
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Senarai Kampung</h1>
          <p className="text-gray-600 mt-2">Urus kawasan pilihan raya</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Tambah Kampung</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau deskripsi kampung..."
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
                Menunjukkan <span className="font-semibold text-gray-900">{filteredVillages.length}</span> daripada{' '}
                <span className="font-semibold text-gray-900">{villages.length}</span> kampung
              </>
            ) : (
              <>
                Jumlah: <span className="font-semibold text-gray-900">{villages.length}</span> kampung
              </>
            )}
          </div>
        </div>
      </div>

      {/* Villages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVillages.map((village) => (
          <div key={village.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MapPinIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{village.name}</h3>
                  <p className="text-sm text-gray-500">ID: {village.id}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleViewVillage(village)}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                  title="Lihat maklumat"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEditVillage(village)}
                  className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteVillage(village)}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                  title="Padam"
                  disabled={village.voter_count > 0}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {village.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{village.description}</p>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <UsersIcon className="h-4 w-4" />
                  <span>{village.voter_count} pengundi</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-green-600">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>{village.votes_cast} mengundi</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {village.voter_count > 0 ? 
                  `${((village.votes_cast / village.voter_count) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVillages.length === 0 && (
        <div className="text-center py-12">
          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Tiada kampung dijumpai</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Cuba cari dengan kata kunci lain' : 'Mulakan dengan menambah kampung baru'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Tambah Kampung</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Village Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tambah Kampung Baru</h3>
            <form onSubmit={handleAddVillage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kampung</label>
                <input
                  type="text"
                  required
                  value={newVillage.name}
                  onChange={(e) => setNewVillage({...newVillage, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama kampung"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  rows="3"
                  value={newVillage.description}
                  onChange={(e) => setNewVillage({...newVillage, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi kampung..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
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

      {/* Edit Village Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Kampung</h3>
            <form onSubmit={handleUpdateVillage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kampung</label>
                <input
                  type="text"
                  required
                  value={editVillage.name}
                  onChange={(e) => setEditVillage({...editVillage, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama kampung"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  rows="3"
                  value={editVillage.description}
                  onChange={(e) => setEditVillage({...editVillage, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi kampung..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
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

      {/* View Village Modal */}
      {showViewModal && selectedVillage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Maklumat Kampung</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Village Info */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MapPinIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedVillage.village.name}</h4>
                  <p className="text-gray-600">ID: {selectedVillage.village.id}</p>
                  {selectedVillage.village.description && (
                    <p className="text-gray-600 mt-1">{selectedVillage.village.description}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedVillage.voters.length}</p>
                  <p className="text-sm text-gray-600">Jumlah Pengundi</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {selectedVillage.voters.filter(v => v.has_voted).length}
                  </p>
                  <p className="text-sm text-gray-600">Sudah Mengundi</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedVillage.voters.length > 0 ? 
                      Math.round((selectedVillage.voters.filter(v => v.has_voted).length / selectedVillage.voters.length) * 100) : 
                      0}%
                  </p>
                  <p className="text-sm text-gray-600">Kadar Kehadiran</p>
                </div>
              </div>

              {/* Voters List */}
              {selectedVillage.voters.length > 0 && (
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-3">Senarai Pengundi</h5>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedVillage.voters.map((voter) => (
                        <div key={voter.id} className="flex items-center justify-between p-2 bg-white rounded">
                          <div>
                            <p className="font-medium text-gray-900">{voter.name}</p>
                            <p className="text-sm text-gray-500">{voter.ic_number}</p>
                          </div>
                          <div className="text-right">
                            {voter.has_voted ? (
                              <div>
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                  Sudah Mengundi
                                </span>
                                {voter.party_name && (
                                  <p className="text-xs text-gray-500 mt-1">{voter.party_name}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                Belum Mengundi
                              </span>
                            )}
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
                  setShowViewModal(false);
                  handleEditVillage(selectedVillage.village);
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

export default Villages;