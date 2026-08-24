import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, Building, MapPin, Briefcase, Calendar, Sparkles, X, Filter, User, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import MagneticButton from '../ui/MagneticButton';
import SpotlightCard from '../ui/SpotlightCard';
import PageTransition, { MotionContainer } from '../ui/PageTransition';
import { DEPARTMENTS } from '../ui/DepartmentSelect';

const StudentFacultyMembers = () => {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faculty/all');
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setFaculties(data);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      toast.error('Failed to load faculty members');
      setFaculties([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculties = faculties.filter(faculty => {
    const name = faculty.name || faculty.userId?.name || '';
    const department = faculty.department || '';
    const email = faculty.email || faculty.userId?.email || '';
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = name.toLowerCase().includes(searchLower) ||
                          department.toLowerCase().includes(searchLower) ||
                          email.toLowerCase().includes(searchLower);

    const matchesDepartment = !selectedDepartment ||
                              department.toLowerCase() === selectedDepartment.toLowerCase();

    return matchesSearch && matchesDepartment;
  });

  return (
    <PageTransition className="py-8 md:py-12 bg-slate-50/80 dark:bg-slate-950/80 pattern-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <MotionContainer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 border border-primary-500/20 dark:border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
              <span>Academic Staff Directory</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Faculty Members</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Explore faculty members by department and book an appointment for academic consultation.
            </p>
          </div>
        </MotionContainer>

        {/* Search & Department Filter */}
        <MotionContainer delay={0.1} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search faculties by name, department, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 text-xs"
              />
            </div>
            <div className="relative sm:w-72">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4 pointer-events-none z-10" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="input-field pl-10 text-xs bg-white dark:bg-slate-900 cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-slate-900">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-white dark:bg-slate-900">
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || selectedDepartment) && (
            <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>Active filters:</span>
              {selectedDepartment && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-medium border border-primary-500/20">
                  Department: {selectedDepartment}
                  <button
                    onClick={() => setSelectedDepartment('')}
                    className="hover:text-primary-800 dark:hover:text-primary-200"
                    title="Clear department filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:text-slate-900 dark:hover:text-white"
                    title="Clear search term"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => { setSearchTerm(''); setSelectedDepartment(''); }}
                className="text-primary-600 dark:text-primary-400 hover:underline font-semibold ml-1"
              >
                Clear all filters
              </button>
            </div>
          )}
        </MotionContainer>

        {/* Faculty Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 dark:border-primary-400 border-t-transparent"></div>
            <span>Loading faculty records...</span>
          </div>
        ) : filteredFaculties.length > 0 ? (
          <MotionContainer delay={0.2} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculties.map((faculty) => {
              const facultyName = faculty.name || faculty.userId?.name || 'Faculty Member';
              const facultyEmail = faculty.email || faculty.userId?.email || 'No email';
              return (
                <SpotlightCard key={faculty._id} spotlightColor="rgba(153, 0, 0, 0.08)" className="p-6 bg-white dark:bg-slate-900/95 border-primary-500/10 dark:border-primary-500/20 shadow-card dark:shadow-card-dark transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-500/10 dark:border-primary-500/20 text-primary-500 dark:text-primary-400 flex items-center justify-center font-bold text-lg shrink-0">
                        {facultyName[0]?.toUpperCase() || 'F'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">{facultyName}</h3>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{faculty.designation || 'Faculty Member'}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{facultyEmail}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>{faculty.department || 'No department'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>Office: {faculty.officeRoom || 'N/A'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>ID: {faculty.facultyId || 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  <MagneticButton
                    variant="primary"
                    onClick={() => navigate(`/student/book-appointment?facultyId=${faculty._id}`, { state: { facultyId: faculty._id } })}
                    className="w-full mt-6 py-2.5 text-xs shadow-md shadow-primary-500/25 dark:shadow-primary-500/50 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Appointment</span>
                  </MagneticButton>
                </SpotlightCard>
              );
            })}
          </MotionContainer>
        ) : (
          <MotionContainer delay={0.2} className="bg-white dark:bg-slate-900/95 rounded-3xl shadow-card dark:shadow-card-dark border border-primary-500/10 dark:border-primary-500/20 p-12 text-center space-y-3 transition-all duration-300">
            <User className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">No Faculty Members Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search or department filter criteria.</p>
          </MotionContainer>
        )}
      </div>
    </PageTransition>
  );
};

export default StudentFacultyMembers;