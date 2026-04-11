package javaapplication17;

import java.util.Arrays;
import java.util.Scanner;

public class JavaApplication17 {
    int[] arr;
    int maxSize;
    int heapSize;
    
    JavaApplication17(int maxSize) {
        this.maxSize = maxSize;
        arr = new int[maxSize];
        heapSize = 0;
    }

    void MinHeapify(int i) {
        int l = lChild(i);
        int r = rChild(i);
        int smallest = i;
        
        if (l < heapSize && arr[l] < arr[i])
            smallest = l;
        
        if (r < heapSize && arr[r] < arr[smallest])
            smallest = r;
            
        if (smallest != i) {
            int temp = arr[i];
            arr[i] = arr[smallest];
            arr[smallest] = temp;
            MinHeapify(smallest);
        }
    }

    int parent(int i) {
        return (i - 1) / 2;
    }

    int lChild(int i) {
        return (2 * i + 1);
    }

    int rChild(int i) {
        return (2 * i + 2);
    }

    int removeMin() {
        if (heapSize <= 0)
            return Integer.MAX_VALUE; 
        if (heapSize == 1) {
            heapSize--;
            return arr[0];
        }

        int root = arr[0];
        arr[0] = arr[heapSize - 1];
        heapSize--;
        
        MinHeapify(0);

        return root;
    }

    void decreaseKey(int i, int newVal) {
        arr[i] = newVal;
        while (i != 0 && arr[parent(i)] > arr[i]) { 
            int temp = arr[i];
            arr[i] = arr[parent(i)];
            arr[parent(i)] = temp;
            i = parent(i);
        }
    }

    int getMin() {
        return arr[0];
    }

    int curSize() {
        return heapSize;
    }

    void deleteKey(int i) {
        decreaseKey(i, Integer.MIN_VALUE);
        removeMin();
    }

    void insertKey(int x) {
        if (heapSize == maxSize) {
            System.out.println("\nOverflow: Could not insertKey\n");
            return;
        }

        heapSize++;
        int i = heapSize - 1;
        arr[i] = x;

        while (i != 0 && arr[parent(i)] > arr[i]) { 
            int temp = arr[i];
            arr[i] = arr[parent(i)];
            arr[parent(i)] = temp;
            i = parent(i);
        }
    }

    public static void main(String[] args) {
        
        JavaApplication17 h = new JavaApplication17(15);

        System.out.println("Entered 6 keys:- 3, 10, 12, 8, 2, 14 \n");
        h.insertKey(3);
        h.insertKey(10);
        h.insertKey(12);
        h.insertKey(8);
        h.insertKey(2);
        h.insertKey(14);

        System.out.println("The current size of the heap is " + h.curSize() + "\n");
        System.out.println("The current minimum element is " + h.getMin() + "\n");

        h.deleteKey(2);
        System.out.println("The current size of the heap is " + h.curSize() + "\n");

        h.insertKey(15);
        h.insertKey(5);
        System.out.println("The current size of the heap is " + h.curSize() + "\n");
        System.out.println("The current minimum element is " + h.getMin() + "\n");
    }
}
