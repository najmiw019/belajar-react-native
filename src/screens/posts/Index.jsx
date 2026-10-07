//import component React Native
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

//import hook useState & useEffect
import React, {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';

//import api
import Api from '../../services/api';

//import BACKEND_API_URL from .env file
import {BACKEND_API_URL} from '@env';

export default function PostIndex({navigation}) {
  //init state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  //method fetchDataPosts
  const fetchDataPosts = useCallback(async () => {
    //set loading true
    setLoading(true);

    try {
      const response = await Api.get('/api/posts');
      //assign data to state
      setPosts(response.data.data);
    } catch (error) {
      Alert.alert(
        'Gagal memuat posts',
        error.response?.data?.message || error.message || 'Periksa koneksi server.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDataPosts();
    }, [fetchDataPosts]),
  );

  //method deletePost
  const deletePost = async id => {
    try {
      await Api.delete(`/api/posts/${id}`);
      await fetchDataPosts();
      Alert.alert('Berhasil', 'Post berhasil dihapus.');
    } catch (error) {
      Alert.alert(
        'Gagal menghapus',
        error.response?.data?.message || error.message || 'Periksa koneksi server.',
      );
    }
  };

  const confirmDelete = id => {
    Alert.alert('Hapus post?', 'Post yang dihapus tidak dapat dikembalikan.', [
      {text: 'Batal', style: 'cancel'},
      {text: 'Hapus', style: 'destructive', onPress: () => deletePost(id)},
    ]);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.text}>Tutorial Express + React Native</Text>
        <View style={styles.line}></View>
        {/** data posts */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#e91e63"
            style={{marginTop: 20}}
          />
        ) : (
          posts.map((post, index) => (
            <View key={index} style={styles.postContainer}>
              <Image
                source={{
                  uri: `${BACKEND_API_URL}/uploads/${post.image}`,
                }}
                style={styles.avatar}
              />
              <View style={styles.content}>
                <Text style={styles.title}>{post.title}</Text>
              </View>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  onPress={() => navigation.push('PostEdit', {id: post.id})}
                  style={styles.button}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => confirmDelete(post.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Floating Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.push('PostCreate')}>
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  line: {
    marginTop: 15,
    width: '100%',
    backgroundColor: '#ddd',
    height: 2,
  },
  postContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#e91e63',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15, // for shadow on Android
    shadowColor: '#000', // for shadow on iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});
