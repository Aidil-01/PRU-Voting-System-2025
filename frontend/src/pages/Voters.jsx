import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { votersAPI, villagesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Voters = () => {
  const [voters, setVoters] = useState([]);
  const [villages, setVillages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVoters, setTotalVoters] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [newVoter, setNewVoter] = useState({
    name: '',
    ic_number: '',
    village_id: ''
  });
  const [editVoter, setEditVoter] = useState({
    id: '',
    name: '',
    ic_number: '',
    village_id: ''
  });

  useEffect(() => {
    loadVillages();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filtering
      loadVoters();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedVillage]);

  useEffect(() => {
    loadVoters();
  }, [currentPage]);

  const loadVoters = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        village: selectedVillage
      };
      console.log('Loading voters with params:', params); // Debug log
      const response = await votersAPI.getAll(params);
      setVoters(response.data.voters);
      setTotalVoters(response.data.total);
      setTotalPages(Math.ceil(response.data.total / 20));
    } catch (error) {
      console.error('Error loading voters:', error);
      console.error('Error details:', error.response?.data); // Debug log
      toast.error('Gagal memuat senarai pengundi');
    }
  };

  const loadVillages = async () => {
    try {
      const response = await villagesAPI.getAll();
      setVillages(response.data);
    } catch (error) {
      console.error('Error loading villages:', error);
    }
  };

  const handleAddVoter = async (e) => {
    e.preventDefault();
    try {
      await votersAPI.add(newVoter);
      toast.success('Pengundi berjaya didaftarkan');
      setNewVoter({ name: '', ic_number: '', village_id: '' });
      setShowAddForm(false);
      loadVoters();
    } catch (error) {
      console.error('Error adding voter:', error);
      toast.error('Gagal mendaftarkan pengundi');
    }
  };

  const formatIC = (ic) => {
    if (!ic) return '';
    return ic.replace(/(\d{6})(\d{2})(\d{4})/, '$1-$2-$3');
  };

  const getVillageById = (villageId) => {
    const village = villages.find(v => v.id === villageId);
    return village?.name || 'Tidak diketahui';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedVillage('');
    setCurrentPage(1);
  };

  const getSelectedVillageName = () => {
    const village = villages.find(v => v.id === parseInt(selectedVillage));
    return village?.name || '';
  };

  const handleViewVoter = async (voter) => {
    setSelectedVoter(voter);
    setShowViewModal(true);
  };

  const handleEditVoter = (voter) => {
    setEditVoter({
      id: voter.id,
      name: voter.name,
      ic_number: voter.ic_number,
      village_id: voter.village_id
    });
    setShowEditForm(true);
  };

  const handleUpdateVoter = async (e) => {
    e.preventDefault();
    try {
      await votersAPI.update(editVoter.id, {
        name: editVoter.name,
        ic_number: editVoter.ic_number,
        village_id: editVoter.village_id
      });
      toast.success('Pengundi berjaya dikemaskini');
      setShowEditForm(false);
      setEditVoter({ id: '', name: '', ic_number: '', village_id: '' });
      loadVoters();
    } catch (error) {
      console.error('Error updating voter:', error);
      toast.error(error.response?.data?.error || 'Gagal mengemaskini pengundi');
    }
  };

  const handleDeleteVoter = async (voter) => {
    if (voter.has_voted) {
      toast.error('Tidak boleh padam pengundi yang sudah mengundi');
      return;
    }

    if (window.confirm(`Adakah anda pasti mahu memadamkan ${voter.name}?`)) {
      try {
        await votersAPI.delete(voter.id);
        toast.success('Pengundi berjaya dipadamkan');
        loadVoters();
      } catch (error) {
        console.error('Error deleting voter:', error);
        toast.error(error.response?.data?.error || 'Gagal memadamkan pengundi');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Senarai Pengundi</h1>
          <p className="text-gray-600 mt-2">Urus data pengundi berdaftar</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Daftar Pengundi</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau IC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Village Filter */}
          <div className="relative">
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Semua Kampung</option>
              {villages.map(village => (
                <option key={village.id} value={village.id}>{village.name}</option>
              ))}
            </select>
            {selectedVillage && (
              <button
                onClick={() => setSelectedVillage('')}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Clear All Filters */}
          {(searchTerm || selectedVillage) && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Clear Filters</span>
            </button>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-3">
            <span className="text-sm text-gray-600">
              {searchTerm || selectedVillage ? (
                <>
                  Menunjukkan <span className="font-semibold text-gray-900">{voters.length}</span> daripada{' '}
                  <span className="font-semibold text-gray-900">{totalVoters}</span>
                  {selectedVillage && <><br/>di <span className="font-semibold text-blue-600">{getSelectedVillageName()}</span></>}
                </>
              ) : (
                <>
                  Jumlah: <span className="font-semibold text-gray-900">{totalVoters}</span> pengundi
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Voters List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Pengundi
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  No. IC
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Kampung
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Masa Mengundi
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {voters.map((voter) => (
                <tr key={voter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{voter.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatIC(voter.ic_number)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                      {voter.village_name || getVillageById(voter.village_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {voter.has_voted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Sudah Mengundi
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Belum Mengundi
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {voter.voted_at ? new Date(voter.voted_at).toLocaleString('ms-MY') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewVoter(voter)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Lihat maklumat"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {!voter.has_voted && (
                        <>
                          <button
                            onClick={() => handleEditVoter(voter)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVoter(voter)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Padam"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sebelum
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Seterus
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Halaman <span className="font-medium">{currentPage}</span> daripada{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Voter Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Pengundi Baru</h3>
            <form onSubmit={handleAddVoter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh</label>
                <input
                  type="text"
                  required
                  value={newVoter.name}
                  onChange={(e) => setNewVoter({...newVoter, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama pengundi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. IC (tanpa sengkang)</label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{12}"
                  value={newVoter.ic_number}
                  onChange={(e) => setNewVoter({...newVoter, ic_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456789012"
                  maxLength="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kampung</label>
                <select
                  required
                  value={newVoter.village_id}
                  onChange={(e) => setNewVoter({...newVoter, village_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih kampung</option>
                  {villages.map(village => (
                    <option key={village.id} value={village.id}>{village.name}</option>
                  ))}
                </select>
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
                  Daftar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Voter Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Pengundi</h3>
            <form onSubmit={handleUpdateVoter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh</label>
                <input
                  type="text"
                  required
                  value={editVoter.name}
                  onChange={(e) => setEditVoter({...editVoter, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama pengundi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. IC (tanpa sengkang)</label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{12}"
                  value={editVoter.ic_number}
                  onChange={(e) => setEditVoter({...editVoter, ic_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456789012"
                  maxLength="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kampung</label>
                <select
                  required
                  value={editVoter.village_id}
                  onChange={(e) => setEditVoter({...editVoter, village_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih kampung</option>
                  {villages.map(village => (
                    <option key={village.id} value={village.id}>{village.name}</option>
                  ))}
                </select>
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

      {/* View Voter Modal */}
      {showViewModal && selectedVoter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Maklumat Pengundi</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedVoter.name}</h4>
                  <p className="text-gray-600">{formatIC(selectedVoter.ic_number)}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Kampung</p>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                      {selectedVoter.village_name || getVillageById(selectedVoter.village_id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">
                      {selectedVoter.has_voted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Sudah Mengundi
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Belum Mengundi
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                {selectedVoter.has_voted && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Masa Mengundi</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedVoter.voted_at).toLocaleString('ms-MY')}
                    </p>
                    {selectedVoter.party_name && (
                      <>
                        <p className="text-sm font-medium text-gray-500 mt-2">Parti Dipilih</p>
                        <p className="mt-1 text-sm text-gray-900">{selectedVoter.party_name}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t">
              {!selectedVoter.has_voted && (
                <>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditVoter(selectedVoter);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleDeleteVoter(selectedVoter);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Padam</span>
                  </button>
                </>
              )}
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

export default Voters;