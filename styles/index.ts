import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 46,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 20,
    },
    settingsButton: {
        alignSelf: "flex-end",
        paddingTop: 20,
        marginRight: 46,
    },
    weatherInfo: {
        paddingHorizontal: 46,
        paddingBottom: 20,
    },
    weatherItem: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    weatherText: {
        fontSize: 16,
        marginLeft: 5,
    },

    carouselSectionOutfit: {
        width: "100%",
        backgroundColor: "#F7F7F7",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingVertical: 20,
        marginBottom: 8,
        height: 180,
        justifyContent: 'center'
    },
    carouselSectionItem: {
        width: '100%',
        marginBottom: 20,
        backgroundColor: "#F7F7F7",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingVertical: 20,
        height: 180,
        justifyContent: 'center'
    },
    carouselContent: {
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 24,
        color: '#000',
        fontWeight: 400,
        marginBottom: 8,
        alignSelf: 'flex-start',
        marginLeft: 46,
    },
    outfitItemsGrid: {
        width: "90%",
        height: "90%",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    outfitItem: {
        width: "45%",
        height: "45%",
        margin: "2%",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: 5,
    },
    outfitItemImage: {
        width: "100%",
        height: "100%",
    },
    outfitItemPlaceholder: {
        fontSize: 10,
        color: "#888",
    },
    itemTile: {
        width: 100,
        height: 100,
        backgroundColor: "#E1E1E1",
        borderRadius: 10,
        marginHorizontal: 15,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    itemImage: {
        width: "80%",
        height: "80%",
        resizeMode: "contain",
        borderRadius: 5,
    },
    placeholderImage: {
        backgroundColor: "#E0E0E0",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: 24,
        color: "#888",
    },
    loadingContainer: {
        width: "100%",
        height: 180,
        justifyContent: "center",
        alignItems: "center",
    },
    noOutfitsContainer: {
        width: "100%",
        height: 100,
        justifyContent: "center",
        alignItems: "center",
    },


    scrollContainer: { padding: 20 },
    text: { fontSize: 18, marginBottom: 10 },
    itemText: { fontSize: 16, color: '#666' },
  });