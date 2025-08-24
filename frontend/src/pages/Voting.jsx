import React, { useState, useEffect } from 'react';
import { 
  CheckBadgeIcon,
  UserIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FlagIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { votersAPI, partiesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Voting = () => {
  const [voters, setVoters] = useState([]);
  const [parties, setParties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [selectedParty, setSelectedParty] = useState('');
  const [loading, setLoading] = useState(false);
  const [villages, setVillages] = useState([]);

  useEffect(() => {
    loadVoters();
    loadParties();
  }, []);

  useEffect(() => {
    filterVoters();
  }, [voters, searchTerm, selectedVillage]);

  const loadVoters = async () => {
    try {
      const response = await votersAPI.getAll();
      setVoters(response.data.voters || []);
      
      // Extract unique villages
      const uniqueVillages = [...new Set(response.data.voters.map(v => v.village_name))];
      setVillages(uniqueVillages);
    } catch (error) {
      console.error('Error loading voters:', error);
      toast.error('Gagal memuat senarai pengundi');
    }
  };

  const loadParties = async () => {
    try {
      const response = await partiesAPI.getAll();
      setParties(response.data || []);
    } catch (error) {
      console.error('Error loading parties:', error);
      toast.error('Gagal memuat senarai parti');
    }
  };

  const filterVoters = () => {
    let filtered = voters.filter(voter => !voter.has_voted); // Only show unvoted voters
    
    if (searchTerm) {
      filtered = filtered.filter(voter =>
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.ic_number.includes(searchTerm) ||
        voter.village_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedVillage) {
      filtered = filtered.filter(voter => voter.village_name === selectedVillage);
    }
    
    setFilteredVoters(filtered);
  };

  const handleVoteClick = (voter) => {
    setSelectedVoter(voter);
    setSelectedParty('');
    setShowVoteModal(true);
  };

  const handleSubmitVote = async () => {
    if (!selectedParty) {
      toast.error('Sila pilih parti untuk mengundi');
      return;
    }

    const confirmed = window.confirm(
      `Adakah anda pasti mahu merekod undi untuk:\n\n` +
      `Pengundi: ${selectedVoter.name}\n` +
      `IC: ${selectedVoter.ic_number}\n` +
      `Kampung: ${selectedVoter.village_name}\n` +
      `Parti: ${parties.find(p => p.id == selectedParty)?.name}\n\n` +
      `Tindakan ini tidak boleh dibatalkan!`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      await votersAPI.vote({
        voter_id: selectedVoter.id,
        party_id: selectedParty
      });

      toast.success(`Undi berjaya direkod untuk ${selectedVoter.name}`);
      setShowVoteModal(false);
      setSelectedVoter(null);
      setSelectedParty('');
      loadVoters(); // Refresh data
    } catch (error) {
      console.error('Error recording vote:', error);
      toast.error(error.response?.data?.error || 'Gagal merekod undi');
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${logoPath}`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedVillage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <CheckBadgeIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistem Pengundian</h1>
            <p className="text-gray-600">Rekod undi pengundi yang belum mengundi</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{filteredVoters.length}</div>
            <div className="text-sm text-gray-600">Belum Mengundi</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {voters.filter(v => v.has_voted).length}
            </div>
            <div className="text-sm text-gray-600">Sudah Mengundi</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{voters.length}</div>
            <div className="text-sm text-gray-600">Jumlah Pengundi</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">
              {voters.length > 0 ? Math.round((voters.filter(v => v.has_voted).length / voters.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Kadar Keluar</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, IC atau kampung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Village Filter */}
          <div>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Kampung</option>
              {villages.map((village, index) => (
                <option key={index} value={village}>{village}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset Filter
            </button>
            <div className="text-sm text-gray-600">
              {filteredVoters.length} pengundi
            </div>
          </div>
        </div>
      </div>

      {/* Voters List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Pengundi Belum Mengundi ({filteredVoters.length})
          </h3>
        </div>

        {filteredVoters.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || selectedVillage ? 'Tiada pengundi dijumpai' : 'Semua pengundi telah mengundi!'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedVillage 
                ? 'Cuba ubah kriteria carian anda' 
                : 'Tahniah! Semua pengundi telah selesai mengundi.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {filteredVoters.map((voter) => (
              <div key={voter.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{voter.name}</h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>IC: {voter.ic_number}</span>
                        <span>•</span>
                        <span>{voter.village_name}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>Belum mengundi</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleVoteClick(voter)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <CheckBadgeIcon className="h-4 w-4" />
                    <span>Rekod Undi</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vote Recording Modal */}
      {showVoteModal && selectedVoter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Rekod Undi</h3>
              <button
                onClick={() => setShowVoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Voter Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedVoter.name}</h4>
                  <div className="text-sm text-gray-500">
                    <p>IC: {selectedVoter.ic_number}</p>
                    <p>Kampung: {selectedVoter.village_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Party Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Pilih Parti yang Diundi:
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {parties.map((party) => (
                  <label
                    key={party.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedParty == party.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="party"
                      value={party.id}
                      checked={selectedParty == party.id}
                      onChange={(e) => setSelectedParty(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div 
                        className="h-8 w-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: party.color }}
                      >
                        {party.logo_path ? (
                          <img 
                            src={getLogoUrl(party.logo_path)} 
                            alt={party.name}
                            className="h-5 w-5 object-contain rounded"
                          />
                        ) : (
                          <FlagIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{party.name}</div>
                        <div className="text-sm text-gray-500">{party.abbreviation}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowVoteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleSubmitVote}
                disabled={!selectedParty || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Merekod...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Rekod Undi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Voting;