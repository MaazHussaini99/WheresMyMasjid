import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DiscoverScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - in production, fetch from API
  const mockData = {
    masjids: [
      {
        id: 1,
        name: "Islamic Center of New York",
        type: "masjid",
        denomination: "Sunni",
        distance: 0.5,
        rating: 4.8,
        address: "1711 3rd Ave, New York, NY",
        phone: "+1-212-534-4000",
        facilities: ["Wudu Area", "Women's Section", "Parking", "Wheelchair Access"],
        prayerTimes: {
          fajr: "5:30 AM",
          dhuhr: "12:45 PM",
          asr: "3:30 PM",
          maghrib: "6:15 PM",
          isha: "7:45 PM",
          jummah: "1:00 PM"
        },
        programs: ["Youth Group", "Sunday School", "Adult Classes"],
        languages: ["English", "Arabic", "Urdu"],
        capacity: 300,
        currentCapacity: 45,
        coordinates: { lat: 40.7589, lng: -73.9441 }
      },
      {
        id: 2,
        name: "Masjid Al-Noor",
        type: "masjid",
        denomination: "Sunni",
        distance: 1.2,
        rating: 4.6,
        address: "456 Brooklyn Ave, Brooklyn, NY",
        phone: "+1-718-555-0123",
        facilities: ["Wudu Area", "Women's Section", "Library"],
        prayerTimes: {
          fajr: "5:35 AM",
          dhuhr: "12:50 PM",
          asr: "3:35 PM",
          maghrib: "6:20 PM",
          isha: "7:50 PM",
          jummah: "1:15 PM"
        },
        programs: ["Quran Classes", "Marriage Counseling"],
        languages: ["English", "Arabic"],
        capacity: 150,
        currentCapacity: 30,
        coordinates: { lat: 40.6782, lng: -73.9442 }
      }
    ],
    schools: [
      {
        id: 3,
        name: "Al-Ihsan Academy",
        type: "school",
        distance: 0.8,
        rating: 4.9,
        address: "789 Education St, New York, NY",
        phone: "+1-212-555-0456",
        grades: "K-12",
        enrollment: 250,
        maxCapacity: 300,
        accreditation: "Middle States Association",
        curriculum: ["Islamic Studies", "Arabic", "Standard Academics"],
        tuitionRange: "$8,000 - $12,000/year",
        acceptingApplications: true,
        coordinates: { lat: 40.7505, lng: -73.9934 }
      },
      {
        id: 4,
        name: "Madinah Islamic School",
        type: "school",
        distance: 1.5,
        rating: 4.7,
        address: "321 Learning Ave, Queens, NY",
        phone: "+1-718-555-0789",
        grades: "Pre-K-8",
        enrollment: 180,
        maxCapacity: 200,
        accreditation: "NYSAIS",
        curriculum: ["Quran Memorization", "Islamic Studies", "STEM"],
        tuitionRange: "$6,000 - $9,000/year",
        acceptingApplications: false,
        coordinates: { lat: 40.7282, lng: -73.7949 }
      }
    ],
    businesses: [
      {
        id: 5,
        name: "Halal Paradise Restaurant",
        type: "restaurant",
        distance: 0.3,
        rating: 4.5,
        address: "123 Halal St, New York, NY",
        phone: "+1-212-555-1234",
        cuisine: "Middle Eastern",
        certification: "Islamic Society of North America",
        priceRange: "$$",
        amenities: ["Prayer Space", "Family Section", "Delivery"],
        coordinates: { lat: 40.7614, lng: -73.9776 }
      },
      {
        id: 6,
        name: "Barakah Grocery",
        type: "market",
        distance: 0.6,
        rating: 4.3,
        address: "567 Market Rd, New York, NY",
        phone: "+1-212-555-5678",
        specialties: ["Halal Meat", "International Foods", "Islamic Books"],
        certification: "Halal Food Authority",
        amenities: ["Fresh Produce", "Butcher Shop", "Islamic Gifts"],
        coordinates: { lat: 40.7831, lng: -73.9712 }
      }
    ]
  };

  const allPlaces = [...mockData.masjids, ...mockData.schools, ...mockData.businesses];

  const filters = [
    { id: 'masjid', label: 'Masjids', icon: 'place' },
    { id: 'school', label: 'Schools', icon: 'school' },
    { id: 'restaurant', label: 'Food', icon: 'restaurant' },
    { id: 'market', label: 'Markets', icon: 'store' },
    { id: 'women_friendly', label: 'Women Friendly', icon: 'person' },
    { id: 'parking', label: 'Parking', icon: 'local-parking' }
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location to find nearby places.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required.');
          setLoading(false);
          return;
        }
      }

      // Configure Geolocation for better accuracy
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
        enableBackgroundLocationUpdates: false,
        locationProvider: 'auto'
      });

      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Location obtained:', position);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Calculate real distances to places
          calculateDistances(position.coords.latitude, position.coords.longitude);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          Alert.alert(
            'Location Error', 
            'Unable to get your location. Using default location (NYC).',
            [{ text: 'OK', onPress: () => setLoading(false) }]
          );
          // Use default NYC location
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
          setLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 20000, 
          maximumAge: 10000,
          showLocationDialog: true,
          forceRequestLocation: true
        }
      );
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request location permission.');
      setLoading(false);
    }
  };

  // Calculate distance between user and places
  const calculateDistances = (userLat, userLng) => {
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 3959; // Radius of Earth in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      return Math.round(distance * 10) / 10; // Round to 1 decimal place
    };

    // Update distances for all places
    [...mockData.masjids, ...mockData.schools, ...mockData.businesses].forEach(place => {
      place.distance = calculateDistance(
        userLat, 
        userLng, 
        place.coordinates.lat, 
        place.coordinates.lng
      );
    });
  };

  const filterPlaces = (places) => {
    let filtered = places;
    
    if (searchQuery) {
      filtered = filtered.filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(place => {
        return selectedFilters.some(filter => {
          switch(filter) {
            case 'masjid': return place.type === 'masjid';
            case 'school': return place.type === 'school';
            case 'restaurant': return place.type === 'restaurant';
            case 'market': return place.type === 'market';
            case 'women_friendly': return place.facilities?.includes("Women's Section");
            case 'parking': return place.facilities?.includes("Parking");
            default: return false;
          }
        });
      });
    }
    
    return filtered.sort((a, b) => a.distance - b.distance);
  };

  const toggleFilter = (filterId) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const openMaps = (place) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${place.coordinates.lat},${place.coordinates.lng}`,
      android: `geo:0,0?q=${place.coordinates.lat},${place.coordinates.lng}`
    });
    Linking.openURL(url).catch(err => {
      console.error('Error opening maps:', err);
      Alert.alert('Error', 'Unable to open maps application.');
    });
  };

  const makePhoneCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(err => {
      console.error('Error making phone call:', err);
      Alert.alert('Error', 'Unable to make phone call.');
    });
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'masjid': return '#10B981';
      case 'school': return '#3B82F6';
      case 'restaurant': return '#F59E0B';
      case 'market': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const saveToFavorites = async (place) => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      const favoritesList = favorites ? JSON.parse(favorites) : [];
      
      if (!favoritesList.find(fav => fav.id === place.id)) {
        favoritesList.push(place);
        await AsyncStorage.setItem('favorites', JSON.stringify(favoritesList));
        Alert.alert('Success', `${place.name} added to favorites!`);
      } else {
        Alert.alert('Info', 'This place is already in your favorites.');
      }
    } catch (error) {
      console.error('Error saving to favorites:', error);
      Alert.alert('Error', 'Failed to save to favorites.');
    }
  };

  const PlaceCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.placeCard}
      onPress={() => {
        setSelectedPlace(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.placeHeader}>
        <View style={styles.placeInfo}>
          <View style={[styles.placeIconContainer, { backgroundColor: getTypeColor(item.type) + '20' }]}>
            <Icon 
              name={item.type === 'masjid' ? 'place' : item.type === 'school' ? 'school' : 'store'} 
              size={24} 
              color={getTypeColor(item.type)} 
            />
          </View>
          <View style={styles.placeDetails}>
            <Text style={styles.placeName}>{item.name}</Text>
            <View style={styles.placeSubInfo}>
              <Icon name="location-on" size={14} color="#6B7280" />
              <Text style={styles.placeDistance}>{item.distance} mi • {item.type}</Text>
            </View>
          </View>
        </View>
        <View style={styles.placeRating}>
          <Icon name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      <Text style={styles.placeAddress} numberOfLines={1}>{item.address}</Text>

      {item.type === 'masjid' && (
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Icon name="access-time" size={16} color="#6B7280" />
            <Text style={styles.infoText}>Next: {item.prayerTimes.dhuhr} (Dhuhr)</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="people" size={16} color="#6B7280" />
            <Text style={styles.infoText}>Capacity: {item.currentCapacity}/{item.capacity}</Text>
          </View>
        </View>
      )}

      {item.type === 'school' && (
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Icon name="school" size={16} color="#6B7280" />
            <Text style={styles.infoText}>Grades: {item.grades}</Text>
          </View>
          {item.acceptingApplications && (
            <View style={styles.infoRow}>
              <Icon name="check-circle" size={16} color="#10B981" />
              <Text style={[styles.infoText, { color: '#10B981', fontWeight: '600' }]}>Accepting Applications</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.placeActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => openMaps(item)}
        >
          <Icon name="directions" size={18} color="#3B82F6" />
          <Text style={styles.actionText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => makePhoneCall(item.phone)}
        >
          <Icon name="phone" size={18} color="#10B981" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => saveToFavorites(item)}
        >
          <Icon name="favorite-border" size={18} color="#F59E0B" />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="location-searching" size={40} color="#3B82F6" />
        <Text style={styles.loadingText}>Finding nearby places...</Text>
        <Text style={styles.loadingSubtext}>Please allow location access when prompted</Text>
      </View>
    );
  }

  const filteredPlaces = filterPlaces(allPlaces);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoSection}>
            <Text style={styles.logoEmoji}>🕌</Text>
            <View>
              <Text style={styles.appTitle}>Where's My Masjid?</Text>
              <Text style={styles.appSubtitle}>Discover • Learn • Connect</Text>
            </View>
          </View>
          <View style={styles.locationSection}>
            <Icon name="location-on" size={16} color="#6B7280" />
            <Text style={styles.locationText}>
              {userLocation ? 'Current Location' : 'New York, NY'}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search masjids, schools, halal food..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Toggle */}
        <View style={styles.filterToggle}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Icon name="filter-list" size={20} color="#6B7280" />
            <Text style={styles.filterButtonText}>
              Filters {selectedFilters.length > 0 && `(${selectedFilters.length})`}
            </Text>
          </TouchableOpacity>
          <Text style={styles.resultsCount}>{filteredPlaces.length} places</Text>
        </View>

        {/* Filters */}
        {showFilters && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map(filter => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedFilters.includes(filter.id) && styles.filterChipActive
                ]}
                onPress={() => toggleFilter(filter.id)}
              >
                <Icon 
                  name={filter.icon} 
                  size={16} 
                  color={selectedFilters.includes(filter.id) ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[
                  styles.filterChipText,
                  selectedFilters.includes(filter.id) && styles.filterChipTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={filteredPlaces}
        renderItem={({ item }) => <PlaceCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No places found</Text>
            <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
          </View>
        )}
      />

      {/* Place Details Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedPlace && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedPlace.name}</Text>
              <TouchableOpacity 
                onPress={() => saveToFavorites(selectedPlace)}
                style={styles.favoriteButton}
              >
                <Icon name="favorite-border" size={24} color="#F59E0B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.contactInfo}>
                  <Icon name="location-on" size={20} color="#6B7280" />
                  <Text style={styles.contactText}>{selectedPlace.address}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Icon name="phone" size={20} color="#6B7280" />
                  <Text style={styles.contactText}>{selectedPlace.phone}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Icon name="near-me" size={20} color="#6B7280" />
                  <Text style={styles.contactText}>{selectedPlace.distance} miles away</Text>
                </View>
              </View>

              {selectedPlace.type === 'masjid' && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Prayer Times</Text>
                    <View style={styles.prayerTimes}>
                      {Object.entries(selectedPlace.prayerTimes).map(([prayer, time]) => (
                        <View key={prayer} style={styles.prayerRow}>
                          <Text style={styles.prayerName}>{prayer.charAt(0).toUpperCase() + prayer.slice(1)}</Text>
                          <Text style={styles.prayerTime}>{time}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Facilities</Text>
                    <View style={styles.tagContainer}>
                      {selectedPlace.facilities.map((facility, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{facility}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Programs</Text>
                    <View style={styles.tagContainer}>
                      {selectedPlace.programs.map((program, index) => (
                        <View key={index} style={[styles.tag, styles.programTag]}>
                          <Text style={[styles.tagText, styles.programTagText]}>{program}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {selectedPlace.type === 'school' && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Academic Information</Text>
                    <View style={styles.schoolDetails}>
                      <Text style={styles.schoolDetailText}>Grades: {selectedPlace.grades}</Text>
                      <Text style={styles.schoolDetailText}>Enrollment: {selectedPlace.enrollment}/{selectedPlace.maxCapacity}</Text>
                      <Text style={styles.schoolDetailText}>Accreditation: {selectedPlace.accreditation}</Text>
                      <Text style={styles.schoolDetailText}>Tuition: {selectedPlace.tuitionRange}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Curriculum</Text>
                    <View style={styles.tagContainer}>
                      {selectedPlace.curriculum.map((subject, index) => (
                        <View key={index} style={[styles.tag, styles.curriculumTag]}>
                          <Text style={[styles.tagText, styles.curriculumTagText]}>{subject}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {selectedPlace.acceptingApplications && (
                    <View style={styles.applicationSection}>
                      <View style={styles.applicationAlert}>
                        <Icon name="check-circle" size={24} color="#10B981" />
                        <Text style={styles.applicationText}>Currently Accepting Applications</Text>
                      </View>
                      <TouchableOpacity style={styles.applicationButton}>
                        <Text style={styles.applicationButtonText}>Request Information</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.directionsButton]}
                onPress={() => openMaps(selectedPlace)}
              >
                <Icon name="directions" size={20} color="#FFFFFF" />
                <Text style={styles.modalActionText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.callButton]}
                onPress={() => makePhoneCall(selectedPlace.phone)}
              >
                <Icon name="phone" size={20} color="#FFFFFF" />
                <Text style={styles.modalActionText}>Call Now</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  placeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeDetails: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  placeSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeDistance: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  placeRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  placeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: '#374151',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  prayerTimes: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prayerName: {
    fontSize: 14,
    color: '#166534',
    textTransform: 'capitalize',
  },
  prayerTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803D',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  programTag: {
    backgroundColor: '#DBEAFE',
  },
  programTagText: {
    color: '#1E40AF',
  },
  curriculumTag: {
    backgroundColor: '#D1FAE5',
  },
  curriculumTagText: {
    color: '#065F46',
  },
  schoolDetails: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
  },
  schoolDetailText: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 4,
  },
  applicationSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  applicationAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  applicationButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applicationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  directionsButton: {
    backgroundColor: '#3B82F6',
  },
  callButton: {
    backgroundColor: '#10B981',
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default DiscoverScreen;