{
    "query": {
        "bool":
        "match": {
            "sellerProductId.poductId.name": "Basmati Rice",
                "sellerProductId.secondaryCategoryId.name": "Basmati Rice",
                    "sellerProductId.primaryCategoryId.name": "Basmati Rice",
                        "sellerType.cities.city.name": "Bangalore"
        }
    }
}