// import component React Native
import {
  Alert,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

//import hook useState
import React, {useState} from 'react';

//import react native image picker
import {launchImageLibrary} from 'react-native-image-picker';

//import api
import Api from '../../services/api';

//import style
import styles from '../../styles';

//import handler error
import {handleErrors} from '../../utils/handleErrors';

export default function PostCreate({navigation}) {
  //init state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  //method handleChoosePhoto
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

  //method storePost
  const storePost = async () => {
    if (!title.trim()) {
      Alert.alert('Validasi', 'Title wajib diisi.');
      return;
    }
    if (saving) {
      return;
    }

    setSaving(true);
    setErrors({});

    //init FormData
    const formData = new FormData();

    //append data
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
      await Api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Berhasil', 'Post berhasil disimpan.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      const responseData = error.response?.data;
      if (responseData?.errors) {
        handleErrors(responseData, setErrors);
        Alert.alert('Gagal menyimpan', responseData.message || 'Periksa kembali data post.');
      } else {
        Alert.alert(
          'Gagal menyimpan',
          responseData?.message || error.message || 'Periksa koneksi ke server.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

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
        {errors?.image && <Text style={styles.error}>{errors?.image}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={value => setTitle(value)}
        />
        {errors?.title && <Text style={styles.error}>{errors?.title}</Text>}
        <TextInput
          style={styles.textarea}
          placeholder="Content"
          value={content}
          onChangeText={value => setContent(value)}
        />
        {errors?.content && (
          <Text style={styles.error}>{errors?.content}</Text>
        )}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={storePost}
            disabled={saving}>
                <Text style={styles.buttonText}>
                  {saving ? 'SAVING...' : 'SAVE'}
                </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
