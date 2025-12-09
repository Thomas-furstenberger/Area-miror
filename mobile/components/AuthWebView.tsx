import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, Text, View, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '@/constants/theme';

interface AuthWebViewProps {
  visible: boolean;
  url: string;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export function AuthWebView({ visible, url, onClose, onSuccess }: AuthWebViewProps) {
  const injectedScript = `
    // On regarde si le texte de la page contient "sessionToken" (la réponse du serveur)
    if (document.body.innerText.includes("sessionToken")) {
      // Si oui, on envoie tout le contenu à l'application mobile
      window.ReactNativeWebView.postMessage(document.body.innerText);
    }
    true;
  `;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Connexion</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={30} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <WebView
          source={{ uri: url }}
          injectedJavaScript={injectedScript}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.success && data.sessionToken) {
                onSuccess(data.sessionToken);
                onClose();
              }
            } catch (e) {}
          }}
          style={{ flex: 1 }}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  title: { ...FONTS.h3, color: COLORS.h1, fontSize: 18 },
  closeBtn: { padding: 4 },
});
