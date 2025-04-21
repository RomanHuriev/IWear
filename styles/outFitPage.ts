import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: "#fff",
        paddingTop: 100,
        paddingBottom: 40,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        right: 46,
        marginBottom: 24,
    },
    title: {
        fontWeight: 400,
        fontSize: 24,
        color: '#000',
        alignSelf: 'flex-start',
        marginLeft: 46,
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: "#e1e1e1",
        borderRadius: 10,
        overflow: "hidden",
    },
    item: {
        backgroundColor: "#e1e1e1",
        justifyContent: "center",
        alignItems: "center",
        borderColor: "white",
        borderWidth: 1,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    buttonsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 40,
        paddingHorizontal: 16,
    },
    removeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '45%',
    },
    saveButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '45%',
    },
    buttonText: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});