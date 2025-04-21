import {StyleSheet, Dimensions} from 'react-native';


const {width} = Dimensions.get('window');
const cameraWidth = Math.min(width * 0.9, 384);
const cameraHeight = (cameraWidth / 384) * 530;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontWeight: 400,
        fontSize: 24,
        color: '#717171',
        paddingTop: 100,
        paddingBottom: 30,
    },
    listItem:{
        height: 32,
        fontSize: 14,
        color: '#717171',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        right: 46,
        marginBottom: 24,
    },
    cameraWrapper: {
        width: cameraWidth,
        height: cameraHeight,
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: '#D9D9D9',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    camera: {
        width: '100%',
        height: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 50,
    },
    button: {
        marginHorizontal: '7%',
        marginVertical: '4%',
    },
    disabledButton: {
        opacity: 0.5,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    loadingScreen: {
        width: width * 0.9,
        height: 360,
        backgroundColor: '#e1e1e1',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    loadingText:{
        position: 'absolute',
        fontWeight: 400,
        fontSize: 24,
        color: '#000',
        bottom: 65,
    },
    permissionButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: '80%',
        marginBottom: 50,
      },
      permissionButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
      },
      imageContainer: {
        marginVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 90,
      },
      image: {
        width: 220,
        height: 220,
        resizeMode: 'cover', 
      },
});