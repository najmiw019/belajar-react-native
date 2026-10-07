import {
  Alert,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import Api from '../../services/api';
import styles from '../../styles';

export default function PostEdit({route, navigation}) {
  const {id} = route.params;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchDetailPost = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Api.get(`/api/posts/${id}`);
      setTitle(response.data.data.title);
      setContent(response.data.data.content || '');
    } catch (error) {
      Alert.alert(
        'Gagal memuat post',
        error.response?.data?.message || error.message || 'Periksa koneksi ke server.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    fetchDetailPost();
  }, [fetchDetailPost]);

  const handleChoosePhoto = () => {
    launchImageLibrary({mediaType: 'photo', noData: true}, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorMessage) {
        Alert.alert('Gagal memilih gambar', response.errorMessage);
        return;
      }
      setImage(response.assets?.[0] ?? null);
    });
  };

  const updatePost = async () => {
    if (!title.trim()) {
      Alert.alert('Validasi', 'Title wajib diisi.');
      return;
    }
    if (saving) {
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content);

    if (image?.uri) {
      formData.append('image', {
        uri: image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || `post-${Date.now()}.jpg`,
      });
    }

    try {
      await Api.put(`/api/posts/${id}`, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });
      Alert.alert('Berhasil', 'Post berhasil diperbarui.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      Alert.alert(
        'Gagal menyimpan',
        error.response?.data?.message || error.message || 'Periksa koneksi ke server.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.upload}>
          <Button
            title="Choose Image"
            color="gray"
            onPress={handleChoosePhoto}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.textarea}
          placeholder="Content"
          value={content}
          onChangeText={setContent}
        />
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={updatePost}
            disabled={saving}>
            <Text style={styles.buttonText}>
              {saving ? 'SAVING...' : 'UPDATE'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
