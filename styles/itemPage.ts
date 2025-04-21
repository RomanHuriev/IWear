import {StyleSheet} from "react-native";

export const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 20,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        right: 46,
        zIndex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    detailsContainer: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 50,
    },
    imageContainer: {
        width: 200,
        height: 200,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImage: {
        width: '90%',
        height: '90%',
        borderRadius: 8,
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#999',
    },
    itemId: {
        fontSize: 14,
        color: '#333',
    },
    fieldsContainer: {
        width: '100%',
        marginBottom: 15,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#d9d9d9",
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginVertical: 10,
        height: 60,
        width: '100%',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
    },
    pickerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        flex: 1,
        gap: 8,
    },
    selectedValue: {
        fontSize: 16,
        fontWeight: "400",
        color: "#000",
        textAlign: 'right',
    },
    picker: {
        position: "absolute",
        opacity: 0,
        width: "100%",
        height: "100%",
    },
    colorCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#999',
    },
    buttonsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
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
        fontSize: 18,
        fontWeight: '700',
        marginTop: 8,
    }
});