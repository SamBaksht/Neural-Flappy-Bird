class Neuron {
    constructor() {
        this.weights = []
    }

    process(inputValues) {
        while (inputValues.length >= this.weights.length) { // If weights don't already exist
            this.weights.push((Math.random() * 2) - 1) // Min -1, Max 1
        }

        let weightTotal = 0;
        for (let i = 0; i < inputValues.length; i++) {
            weightTotal += this.weights[i] * inputValues[i];
        }
        weightTotal += this.weights[this.weights.length - 1]; // Bias factor (Constant value)
        return weightTotal > 0 ? 1 : 0; // returns either 1 or 0 based on total weight of weightTotal
    }
}

class Layer {
    constructor(neuronAmount) {
        this.neurons = [];

        for (let i = 0; i < neuronAmount; i++) {
            this.neurons.push(new Neuron()); // create the proper amount of neurons
        }
    }

    compute(inputValues) {
        return this.neurons.map(neuron => neuron.process(inputValues)) // return an array of values
    }
}


class Network {
    constructor() {
        // Two hidden layers with one output layer (0 or 1)
        this.layers = [new Layer(4), new Layer(4), new Layer(1)]; // Multiple layers for each bird
    }
    /**
     * Computes inputValue from layer1, feeds it into layer2, then takes the final values from layer2 and computes it in the output layer
    @param {number[]} inputValues
    */
    decide(inputValues) {
        for (let layer of this.layers) {
            inputValues = layer.compute(inputValues)
        }
        const decision = inputValues[0];
        
        return decision != 0;
    }
}


function mutate(parentNet) {
    const MUTATION_RATE = 0.05;
    let mutation = new Network();

    // Copy weights with possible mutations
    for (let i = 0; i < parentNet.layers.length; i++) {
        for (let j = 0; j < parentNet.layers[i].neurons.length; j++) {
            for (let k = 0; k < parentNet.layers[i].neurons[j].weights.length; k++) {
                if (Math.random() <= MUTATION_RATE) {
                    // Create new random weight
                    mutation.layers[i].neurons[j].weights[k] = Math.random() * 2 - 1;
                } else {
                    // Copy parent's weight
                    mutation.layers[i].neurons[j].weights[k] = parentNet.layers[i].neurons[j].weights[k];
                }
            }
        }
    }

    return mutation;
}
